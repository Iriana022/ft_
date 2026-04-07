import { useState } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Tag, 
  Clock, 
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Lock,
  MessagesSquare
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { Ticket, TicketStatus, Priority, UserRole } from '../types';
import { mockInternalNotes, mockResponses, InternalNote, Response } from '../data/ticketDetails';

interface TicketDetailProps {
  ticket: Ticket;
  currentRole: UserRole;
  onBack: () => void;
}

const statusConfig = {
  [TicketStatus.OPEN]: { 
    label: 'Ouvert', 
    color: 'bg-red-100 text-red-700 border-red-200', 
    colorDark: 'bg-red-600/20 text-red-400 border-red-600/30',
    icon: AlertCircle
  },
  [TicketStatus.IN_PROGRESS]: { 
    label: 'En cours', 
    color: 'bg-orange-100 text-orange-700 border-orange-200', 
    colorDark: 'bg-orange-600/20 text-orange-400 border-orange-600/30',
    icon: Clock
  },
  [TicketStatus.RESOLVED]: { 
    label: 'Résolu', 
    color: 'bg-green-100 text-green-700 border-green-200', 
    colorDark: 'bg-green-600/20 text-green-400 border-green-600/30',
    icon: CheckCircle2
  },
  [TicketStatus.CLOSED]: { 
    label: 'Fermé', 
    color: 'bg-gray-100 text-gray-700 border-gray-200', 
    colorDark: 'bg-gray-600/20 text-gray-400 border-gray-600/30',
    icon: CheckCircle2
  }
};

const priorityConfig = {
  [Priority.LOW]: { label: 'Basse', color: 'text-green-600', bg: 'bg-green-50', bgDark: 'bg-green-600/10' },
  [Priority.MEDIUM]: { label: 'Moyenne', color: 'text-blue-600', bg: 'bg-blue-50', bgDark: 'bg-blue-600/10' },
  [Priority.HIGH]: { label: 'Haute', color: 'text-orange-600', bg: 'bg-orange-50', bgDark: 'bg-orange-600/10' },
  [Priority.URGENT]: { label: 'Urgent', color: 'text-red-600', bg: 'bg-red-50', bgDark: 'bg-red-600/10' }
};

export function TicketDetail({ ticket, currentRole, onBack }: TicketDetailProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [newResponse, setNewResponse] = useState('');
  const [newNote, setNewNote] = useState('');
  const [activeTab, setActiveTab] = useState<'responses' | 'notes'>('responses');
  
  const responses = mockResponses[ticket.id] || [];
  const internalNotes = mockInternalNotes[ticket.id] || [];
  
  const isAgent = currentRole === UserRole.AGENT || currentRole === UserRole.ADMIN;

  const StatusIcon = statusConfig[ticket.status].icon;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const formatDateShort = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const handleSendResponse = () => {
    if (newResponse.trim()) {
      console.log('Nouvelle réponse:', newResponse);
      setNewResponse('');
    }
  };

  const handleSendNote = () => {
    if (newNote.trim()) {
      console.log('Nouvelle note interne:', newNote);
      setNewNote('');
    }
  };

  return (
    <div className={`flex-1 overflow-auto ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`border-b px-8 py-6 ${
        isDark ? 'bg-[#121212] border-[#2a2a2a]' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              isDark
                ? 'text-gray-400 hover:bg-[#1a1a1a] hover:text-gray-300'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Retour</span>
          </button>
          <ThemeToggle />
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-sm font-medium ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Ticket #{ticket.id}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border inline-flex items-center gap-2 ${
                isDark 
                  ? statusConfig[ticket.status].colorDark 
                  : statusConfig[ticket.status].color
              }`}>
                <StatusIcon className="w-4 h-4" />
                {statusConfig[ticket.status].label}
              </span>
            </div>
            <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              {ticket.title}
            </h1>
            <div className={`flex items-center gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <div className="flex items-center gap-2">
                <img
                  src={ticket.author.avatar}
                  alt={ticket.author.login || ''}
                  className="w-6 h-6 rounded-full"
                />
                <span>Créé par <strong>{ticket.author.login}</strong></span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(ticket.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {isAgent && (
            <div className="flex gap-2">
              <select
                value={ticket.status}
                className={`px-4 py-2 rounded-lg border transition-colors font-medium ${
                  isDark
                    ? 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-100'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value={TicketStatus.OPEN}>Ouvert</option>
                <option value={TicketStatus.IN_PROGRESS}>En cours</option>
                <option value={TicketStatus.RESOLVED}>Résolu</option>
                <option value={TicketStatus.CLOSED}>Fermé</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-6 p-8">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Description */}
          <div className={`rounded-xl border p-6 ${
            isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Description
            </h2>
            <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {ticket.description}
            </p>
          </div>

          {/* Tabs */}
          <div className={`rounded-xl border overflow-hidden ${
            isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'
          }`}>
            {/* Tab Headers */}
            <div className={`flex border-b ${isDark ? 'border-[#2a2a2a]' : 'border-gray-200'}`}>
              <button
                onClick={() => setActiveTab('responses')}
                className={`flex-1 px-6 py-4 font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'responses'
                    ? isDark
                      ? 'bg-[#242424] text-indigo-400 border-b-2 border-indigo-400'
                      : 'bg-gray-50 text-indigo-600 border-b-2 border-indigo-600'
                    : isDark
                      ? 'text-gray-400 hover:bg-[#1a1a1a]'
                      : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <MessagesSquare className="w-5 h-5" />
                Réponses ({responses.length})
              </button>
              {isAgent && (
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`flex-1 px-6 py-4 font-medium transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'notes'
                      ? isDark
                        ? 'bg-[#242424] text-indigo-400 border-b-2 border-indigo-400'
                        : 'bg-gray-50 text-indigo-600 border-b-2 border-indigo-600'
                      : isDark
                        ? 'text-gray-400 hover:bg-[#1a1a1a]'
                        : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Lock className="w-5 h-5" />
                  Notes internes ({internalNotes.length})
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'responses' ? (
                <div className="space-y-6">
                  {/* Response Form */}
                  {isAgent && (
                    <div className={`rounded-lg border p-4 ${
                      isDark ? 'bg-[#121212] border-[#2a2a2a]' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        <span className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                          Répondre au client
                        </span>
                      </div>
                      <textarea
                        value={newResponse}
                        onChange={(e) => setNewResponse(e.target.value)}
                        placeholder="Écrivez votre réponse au client..."
                        rows={3}
                        className={`w-full px-4 py-3 rounded-lg border resize-none transition-colors ${
                          isDark
                            ? 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-100 placeholder:text-gray-600 focus:border-indigo-500'
                            : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-indigo-600'
                        } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                      />
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={handleSendResponse}
                          disabled={!newResponse.trim()}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="w-4 h-4" />
                          Envoyer la réponse
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Responses List */}
                  <div className="space-y-4">
                    {responses.length === 0 ? (
                      <div className="text-center py-8">
                        <MessagesSquare className={`w-12 h-12 mx-auto mb-3 ${
                          isDark ? 'text-gray-700' : 'text-gray-300'
                        }`} />
                        <p className={isDark ? 'text-gray-500' : 'text-gray-600'}>
                          Aucune réponse pour le moment
                        </p>
                      </div>
                    ) : (
                      responses.map((response) => (
                        <div
                          key={response.id}
                          className={`rounded-lg border p-4 ${
                            response.isFromSupport
                              ? isDark 
                                ? 'bg-indigo-600/5 border-indigo-600/20' 
                                : 'bg-indigo-50/50 border-indigo-200'
                              : isDark 
                                ? 'bg-[#121212] border-[#2a2a2a]' 
                                : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={response.author.avatar}
                              alt={response.author.login || ''}
                              className="w-10 h-10 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`font-semibold ${
                                  isDark ? 'text-gray-100' : 'text-gray-900'
                                }`}>
                                  {response.author.login}
                                </span>
                                {response.isFromSupport && (
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    isDark 
                                      ? 'bg-indigo-600/20 text-indigo-400' 
                                      : 'bg-indigo-100 text-indigo-700'
                                  }`}>
                                    Support
                                  </span>
                                )}
                                <span className={`text-sm ${
                                  isDark ? 'text-gray-500' : 'text-gray-500'
                                }`}>
                                  {formatDateShort(response.createdAt)}
                                </span>
                              </div>
                              <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {response.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Internal Note Form */}
                  <div className={`rounded-lg border p-4 ${
                    isDark ? 'bg-[#121212] border-[#2a2a2a]' : 'bg-yellow-50/50 border-yellow-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Lock className={`w-5 h-5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                      <span className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                        Ajouter une note interne
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        isDark ? 'bg-yellow-600/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        Visible uniquement par les agents
                      </span>
                    </div>
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Ajoutez une note privée pour l'équipe de support..."
                      rows={3}
                      className={`w-full px-4 py-3 rounded-lg border resize-none transition-colors ${
                        isDark
                          ? 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-100 placeholder:text-gray-600 focus:border-yellow-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-yellow-600'
                      } focus:outline-none focus:ring-2 focus:ring-yellow-500/20`}
                    />
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={handleSendNote}
                        disabled={!newNote.trim()}
                        className={`px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                          isDark
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                            : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        }`}
                      >
                        <Send className="w-4 h-4" />
                        Ajouter la note
                      </button>
                    </div>
                  </div>

                  {/* Internal Notes List */}
                  <div className="space-y-4">
                    {internalNotes.length === 0 ? (
                      <div className="text-center py-8">
                        <Lock className={`w-12 h-12 mx-auto mb-3 ${
                          isDark ? 'text-gray-700' : 'text-gray-300'
                        }`} />
                        <p className={isDark ? 'text-gray-500' : 'text-gray-600'}>
                          Aucune note interne pour le moment
                        </p>
                      </div>
                    ) : (
                      internalNotes.map((note) => (
                        <div
                          key={note.id}
                          className={`rounded-lg border p-4 ${
                            isDark 
                              ? 'bg-yellow-600/5 border-yellow-600/20' 
                              : 'bg-yellow-50/50 border-yellow-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={note.author.avatar}
                              alt={note.author.login || ''}
                              className="w-10 h-10 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`font-semibold ${
                                  isDark ? 'text-gray-100' : 'text-gray-900'
                                }`}>
                                  {note.author.login}
                                </span>
                                <Lock className={`w-3 h-3 ${
                                  isDark ? 'text-yellow-400' : 'text-yellow-600'
                                }`} />
                                <span className={`text-sm ${
                                  isDark ? 'text-gray-500' : 'text-gray-500'
                                }`}>
                                  {formatDateShort(note.createdAt)}
                                </span>
                              </div>
                              <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {note.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 space-y-6">
          {/* Metadata Card */}
          <div className={`rounded-xl border p-6 ${
            isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Détails
            </h3>
            
            <div className="space-y-4">
              {/* Priority */}
              <div>
                <div className={`flex items-center gap-2 text-sm mb-2 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <Tag className="w-4 h-4" />
                  <span className="font-medium">Priorité</span>
                </div>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                  isDark 
                    ? priorityConfig[ticket.priority].bgDark 
                    : priorityConfig[ticket.priority].bg
                }`}>
                  <AlertCircle className={`w-4 h-4 ${priorityConfig[ticket.priority].color}`} />
                  <span className={`font-medium ${priorityConfig[ticket.priority].color}`}>
                    {priorityConfig[ticket.priority].label}
                  </span>
                </div>
              </div>

              {/* Assigned To */}
              <div>
                <div className={`flex items-center gap-2 text-sm mb-2 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <User className="w-4 h-4" />
                  <span className="font-medium">Assigné à</span>
                </div>
                {ticket.assignedTo ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={ticket.assignedTo.avatar}
                      alt={ticket.assignedTo.login || ''}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                        {ticket.assignedTo.login}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        {ticket.assignedTo.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    Non assigné
                  </p>
                )}
              </div>

              {/* Created */}
              <div>
                <div className={`flex items-center gap-2 text-sm mb-2 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Date de création</span>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {formatDate(ticket.createdAt)}
                </p>
              </div>

              {/* Updated */}
              <div>
                <div className={`flex items-center gap-2 text-sm mb-2 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Dernière mise à jour</span>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {formatDate(ticket.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Author Card */}
          <div className={`rounded-xl border p-6 ${
            isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Auteur
            </h3>
            <div className="flex items-center gap-3">
              <img
                src={ticket.author.avatar}
                alt={ticket.author.login || ''}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  {ticket.author.login}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {ticket.author.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}