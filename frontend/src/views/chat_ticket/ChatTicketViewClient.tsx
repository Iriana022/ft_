import { useState, useEffect, useRef } from 'react';
import ContainerComp from '../../layout/layout_client/Container';
import Separator from '../../components/client_components/Separator';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import type { ChatMessage, TicketType } from '../../types';
import { TicketStatus } from '../../types';
import Avatar from '../../components/client_components/Avatar';
import avatar1 from '../../../public/assets/avatars/avatar1.jpg';
import avatar2 from '../../../public/assets/avatars/avatar2.png';
import { getTicketMessages, sendTicketMessage } from '../../services/tickets';
import { io } from 'socket.io-client';

interface TicketMessageHeaderProps {
  title: string;
}

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
    if (currentStatus === TicketStatus.IN_PROGRESS) setChatUnlocked(true);
    if (currentStatus === TicketStatus.CLOSED) setChatUnlocked(false);
  }, [currentStatus]);

  // Charger les messages au démarrage
  useEffect(() => {
    if (!ticketId || !chatUnlocked || currentStatus === TicketStatus.CLOSED) {
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

    // Connexion WebSocket
    const socket = io('/', {
      path: '/socket.io',
      transports: ['websocket'],
      withCredentials: true,
    });

    // Rejoindre la room du ticket
    socket.emit('joinTicket', { ticketId });

    // Écouter les nouveaux messages
    socket.on('newMessage', (message: ChatMessage) => {
      setMessages((prev) => [...prev, {
        ...message,
        createdAt: new Date(message.createdAt)
      }]);
    });

    return () => {
      socket.emit('leaveTicket', { ticketId });
      socket.disconnect();
    };
  }, [ticketId, chatUnlocked, currentStatus]);

  useEffect(() => {
    if (!ticketId) return;

    const socket = io('/', {
      path: '/socket.io',
      transports: ['websocket'],
      withCredentials: true,
    });

    socket.on('ticketStatusUpdated', (updatedTicket: { id: number; status: TicketStatus }) => {
      if (updatedTicket.id !== ticketId) return;
      setCurrentStatus(updatedTicket.status);
    });

    socket.on('ticketClosed', () => {
      setCurrentStatus(TicketStatus.CLOSED);
    });

    return () => socket.disconnect();
  }, [ticketId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isClosed) return;

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
      {chatUnlocked && !isClosed &&(
        <div className="sticky bottom-0 left-0 right-0 z-50 bg-base-100 border-t">
          <ContainerComp>
            <div className="w-full px-4 py-3">
              <div className="flex gap-2 w-full items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Écrire un message..."
                  className="input input-bordered w-full min-h-[50px] bg-gray-100 text-sm md:text-base"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="btn btn-primary"
                >
                  Envoyer
                </button>
              </div>
            </div>
          </ContainerComp>
        </div>
      )}
    </>
  );
}

export default ChatTicketViewClient;