import { useState, useEffect, useRef } from 'react';
import ContainerComp from '../../layout/layout_client/Container';
import Separator from '../../components/client_components/Separator';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import type { ChatMessage, TicketType } from '../../types';
import { TicketStatus } from '../../types';
import Avatar from '../../components/client_components/Avatar';
import { getTicketMessages, sendTicketMessage } from '../../services/tickets';
import { getSocket } from '../../services/singleton';
import { markTicketMessagesAsRead } from '../../services/tickets';

interface TicketMessageHeaderProps {
  title: string;
}

const avatar2 = '/assets/avatars/avatar2.png';
const avatar1 = '/assets/avatars/avatar1.jpg';

function TicketMessageHeader({ title }: TicketMessageHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-50 bg-[#FBF6F6]">
      <ContainerComp>
        <div className="chat-header flex items-center pt-10 pb-4 gap-6">
          <button onClick={() => navigate(-1)} className="cursor-pointer">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h3 className="text-md md:text-xl">{title}</h3>
        </div>
      </ContainerComp>
      <Separator />
    </div>
  );
}

function ChatTicketViewClient() {
  const location = useLocation();
  const state = (location.state ?? {}) as Partial<TicketType>;
  const ticketId = state.id ?? 0;
  const ticketStatus = state.status;
  const [currentStatus, setCurrentStatus] = useState<TicketStatus>(
    ticketStatus ?? TicketStatus.OPEN
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const isClosed = currentStatus === TicketStatus.CLOSED;
  const canSendMessage = currentStatus === TicketStatus.IN_PROGRESS;
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chatUnlocked, setChatUnlocked] = useState(
    (ticketStatus ?? TicketStatus.OPEN) === TicketStatus.IN_PROGRESS
  );

  // Scroll automatique vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setChatUnlocked(currentStatus === TicketStatus.IN_PROGRESS);
  }, [currentStatus]);

  useEffect(() => {
    if (!ticketId)
      return;
    markTicketMessagesAsRead(ticketId).catch((error) => {
      console.error('Erro an reset unread client', error);
    })
  }, [ticketId]);

  // Charger les messages au démarrage
  useEffect(() => {
    if (!ticketId) {
      setIsLoading(false);
      return;
    }

    const loadMessages = async () => {
      try {
        const data = await getTicketMessages(ticketId);
        setMessages(data);
      } catch (error) {
        console.error('Erreur chargement messages:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadMessages();
  }, [ticketId]);

  useEffect(() => {
    if (!ticketId)
      return;

    const socket = getSocket();

    const joinRoom = () => {
      socket.emit('joinTicket', { ticketId });
    }

    const onnewMessage = (message: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id))
          return prev;
        return [...prev, { ...message, createdAt: new Date(message.createdAt) }];
      });
      if (message.isFromSupport) {
        markTicketMessagesAsRead(ticketId).catch(() => { });
      }
    };

    const onticketStatusUpdated = (updatedTicket: { id: number; status: TicketStatus }) => {
      if (updatedTicket.id !== ticketId) return;
      setCurrentStatus(updatedTicket.status);
    };

    const onticketClosed = (payload?: { ticketId?: number }) => {
      if (!payload?.ticketId || payload.ticketId === ticketId)
        setCurrentStatus(TicketStatus.CLOSED);
    };

    socket.on('connect', joinRoom);
    socket.on('newMessage', onnewMessage);
    socket.on('ticketStatusUpdated', onticketStatusUpdated);
    socket.on('ticketClosed', onticketClosed);
    if (socket.connected)
      joinRoom();
    return () => {
      socket.emit('leaveTicket', { ticketId });
      socket.off('connect', joinRoom);
      socket.off('newMessage', onnewMessage);
      socket.off('ticketStatusUpdated', onticketStatusUpdated);
      socket.off('ticketClosed', onticketClosed);
    }
  }, [ticketId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !canSendMessage || isClosed) return;

    try {
      await sendTicketMessage(ticketId, newMessage, false);
      setNewMessage('');
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

  const formatDateShort = (dateValue: Date | string) => {
    const date = new Date(dateValue);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <>
      <TicketMessageHeader title={state.title ?? 'Conversation ticket'} />

      {/* Canal fermé */}
      {isClosed && (
        <div className="mx-4 mt-4 rounded-lg bg-gray-100 border border-gray-300 p-3 text-center text-sm text-gray-600">
          🔒 Ce canal de messagerie est fermé.
        </div>
      )}

      {/* Canal pas encore ouvert */}
      {!chatUnlocked && !isClosed && (
        <div className="mx-4 mt-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-center text-sm text-yellow-700">
          ⏳ Le canal de messagerie s'ouvrira quand un agent prendra en charge votre ticket.
        </div>
      )}

      {/* Messages */}
      <ContainerComp>
        <div className="flex flex-col space-y-4 p-4 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <p className="text-center text-sm text-gray-500">Chargement...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-sm text-gray-500">Aucun message pour le moment.</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`chat ${msg.isFromSupport ? 'chat-start' : 'chat-end'}`}>
                <div className="chat-image avatar">
                  <Avatar src={msg.isFromSupport ? avatar2 : avatar1} size="sm" />
                </div>
                <div className={`chat-bubble text-sm md:text-base ${msg.isFromSupport ? '' : 'chat-bubble-info'}`}>
                  {msg.content}
                </div>
                <div className="chat-footer text-xs opacity-50">
                  {formatDateShort(msg.createdAt)}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ContainerComp>

      {/* Input message */}
      <div className="sticky bottom-0 left-0 right-0 z-50 bg-base-100 border-t">
        <ContainerComp>
          <div className="w-full px-4 py-3">
            <div className="flex gap-2 w-full items-center">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={canSendMessage ? 'Écrire un message...' : 'Envoi désactivé : pas d’agent disponible'}
                disabled={!canSendMessage || isClosed}
                className="input input-bordered w-full min-h-[50px] bg-gray-100 text-sm md:text-base"
              />
              <button
                onClick={handleSendMessage}
                disabled={!canSendMessage || isClosed || !newMessage.trim()}
                className="btn btn-primary"
              >
                Envoyer
              </button>
            </div>
          </div>
        </ContainerComp>
      </div>
    </>
  );
}

export default ChatTicketViewClient;