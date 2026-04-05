import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
	AlertCircle,
	ArrowLeft,
	Calendar,
	CheckCircle2,
	Clock,
	Lock,
	MessageSquare,
	MessagesSquare,
	Send,
	Tag,
	User,
} from 'lucide-react';
import { ThemeToggle } from '../../components/agent_components/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { TicketPriority, TicketStatus, type Ticket, type ChatMessage } from '../../types';
import { markTicketMessagesAsRead, updateTicketStatus, getTicketMessages, sendTicketMessage } from '../../services/tickets';
import { getSocket } from '../../services/singleton';

type InternalNote = {
	id: number;
	content: string;
	author: string;
	createdAt: Date;
};

type LocationState = {
	ticket?: Ticket;
};

const statusConfig = {
	[TicketStatus.OPEN]: {
		label: 'Ouvert',
		color: 'bg-red-100 text-red-700 border-red-200',
		colorDark: 'bg-red-600/20 text-red-400 border-red-600/30',
		icon: AlertCircle,
	},
	[TicketStatus.IN_PROGRESS]: {
		label: 'En cours',
		color: 'bg-orange-100 text-orange-700 border-orange-200',
		colorDark: 'bg-orange-600/20 text-orange-400 border-orange-600/30',
		icon: Clock,
	},
	[TicketStatus.RESOLVED]: {
		label: 'Résolu',
		color: 'bg-green-100 text-green-700 border-green-200',
		colorDark: 'bg-green-600/20 text-green-400 border-green-600/30',
		icon: CheckCircle2,
	},
	[TicketStatus.CLOSED]: {
		label: 'Fermé',
		color: 'bg-gray-100 text-gray-700 border-gray-200',
		colorDark: 'bg-gray-600/20 text-gray-400 border-gray-600/30',
		icon: CheckCircle2,
	},
};

const priorityConfig = {
	[TicketPriority.LOW]: { label: 'Basse', color: 'text-green-600', bg: 'bg-green-50', bgDark: 'bg-green-600/10' },
	[TicketPriority.MEDIUM]: { label: 'Moyenne', color: 'text-blue-600', bg: 'bg-blue-50', bgDark: 'bg-blue-600/10' },
	[TicketPriority.HIGH]: { label: 'Haute', color: 'text-orange-600', bg: 'bg-orange-50', bgDark: 'bg-orange-600/10' },
	[TicketPriority.URGENT]: { label: 'Urgent', color: 'text-red-600', bg: 'bg-red-50', bgDark: 'bg-red-600/10' },
};

function ChatTicketView() {
	const navigate = useNavigate();
	const { theme } = useTheme();
	const isDark = theme === 'dark';
	const location = useLocation() as { state?: LocationState };
	const [searchParams] = useSearchParams();
	const [activeTab, setActiveTab] = useState<'responses' | 'notes'>('responses');
	const [newResponse, setNewResponse] = useState('');
	const [newNote, setNewNote] = useState('');

	const fallbackId = Number(searchParams.get('ticketId') ?? '0') || 0;
	const fallbackTicket: Ticket = {
		id: fallbackId,
		title: 'Ticket',
		description: 'Aucune description transmise.',
		status: TicketStatus.OPEN,
		priority: TicketPriority.MEDIUM,
		createdAt: new Date(),
		updatedAt: new Date(),
		author: {
			id: 0,
			email: 'unknown@ticket.local',
			login: 'Unknown',
			role: undefined as never,
			createdAt: new Date(),
		},
		authorId: 0,
		clientUnreadCount: 0,
		agentUnreadCount: 0
	};

	const initialTicket = location.state?.ticket ?? fallbackTicket;
	const [ticket, setTicket] = useState<Ticket>(initialTicket);
	const [selectedStatus, setSelectedStatus] = useState<TicketStatus>(initialTicket.status);
	const [isSavingStatus, setIsSavingStatus] = useState(false);
	const [responses, setResponses] = useState<ChatMessage[]>([]);
	const [isLoadingMessages, setIsLoadingMessages] = useState(true);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const [notes, setNotes] = useState<InternalNote[]>([
		{
			id: 1,
			content: 'Reproduit côté agent. Vérifier la config API.',
			author: 'Agent',
			createdAt: new Date(),
		},
	]);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	const [chatUnlocked, setChatUnlocked] = useState(
		initialTicket.status === TicketStatus.IN_PROGRESS
	);

	useEffect(() => {
		if (ticket.status === TicketStatus.IN_PROGRESS) setChatUnlocked(true);
		if (ticket.status === TicketStatus.CLOSED) setChatUnlocked(false);
	}, [ticket.status]);

	useEffect(() => {
		scrollToBottom();
	}, [responses]);

	useEffect(() => {
		setSelectedStatus(ticket.status);
	}, [ticket.status]);

	useEffect(() => {
		if (!ticket.id) return;
		markTicketMessagesAsRead(ticket.id).catch((error) => {
			console.error('Erreur reset unread agent:', error);
		});
	}, [ticket.id]);

	useEffect(() => {
		if (!chatUnlocked || ticket.status === TicketStatus.CLOSED) {
			setIsLoadingMessages(false);
			return;
		}

		const loadMessages = async () => {
			try {
				const data = await getTicketMessages(ticket.id);
				setResponses(data);
			} catch (error) {
				console.error('Erreur chargement messages:', error);
			} finally {
				setIsLoadingMessages(false);
			}
		};
		loadMessages();

		const socket = getSocket();

		const joinRoom = () => {
			socket.emit('joinTicket', { ticketId: ticket.id });
		}

		const onNewMessage = (message: ChatMessage) => {
			setResponses((prev) => {
				if (prev.some((m) => m.id === message.id))
					return prev;
				return [
					...prev,
					{
						...message,
						createdAt: new Date(message.createdAt),
					},
				];
			});
			if (!message.isFromSupport) {
				markTicketMessagesAsRead(ticket.id).catch(() => { });
			}
		};

		socket.on('connect', joinRoom);
		socket.on('newMessage', onNewMessage);
		if (socket.connected)
			joinRoom();
		return () => {
			socket.emit('leaveTicket', { ticketId: ticket.id });
			socket.off('connect', joinRoom);
			socket.off('newMessage', onNewMessage);
		};
	}, [ticket.id, ticket.status, chatUnlocked]);

	const formatDate = (dateValue: Date | string) => {
		const date = new Date(dateValue);
		return new Intl.DateTimeFormat('fr-FR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		}).format(date);
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

	const handleSendResponse = async () => {
		if (!newResponse.trim()) return;

		try {
			const created = await sendTicketMessage(ticket.id, newResponse, true);

			// Affichage immédiat côté agent
			setResponses((prev) => {
				if (prev.some((m) => m.id === created.id)) return prev;
				return [...prev, created];
			});

			setNewResponse('');
		} catch (error: any) {
			console.error('Erreur envoi message:', error?.response?.data ?? error);
		}
	};

	const handleSendNote = () => {
		if (!newNote.trim()) return;
		setNotes((prev: InternalNote[]) => [
			...prev,
			{
				id: prev.length + 1,
				content: newNote,
				author: 'Agent',
				createdAt: new Date(),
			},
		]);
		setNewNote('');
	};

	const handleUpdateStatus = async () => {
		setIsSavingStatus(true);

		try {
			const updatedTicket = await updateTicketStatus(ticket.id, selectedStatus);
			setTicket(updatedTicket);
		} catch (error) {
			console.error('Erreur mise à jour statut ticket:', error);
		} finally {
			setIsSavingStatus(false);
		}
	};

	return (
		<div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
			<div className={`border-b px-4 py-4 md:px-8 ${isDark ? 'bg-[#121212] border-[#2a2a2a]' : 'bg-white border-gray-200'}`}>
				<div className="flex items-center justify-between">
					<button
						onClick={() => navigate(-1)}
						className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${isDark ? 'text-gray-400 hover:bg-[#1a1a1a] hover:text-gray-300' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
							}`}
					>
						<ArrowLeft className="h-5 w-5" />
						<span className="font-medium">Retour</span>
					</button>
					<div className="flex items-center gap-2">
						<ThemeToggle />
						<Link
							to="/agent"
							className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${isDark ? 'border-[#2a2a2a] text-gray-300 hover:bg-[#1a1a1a]' : 'border-gray-300 text-gray-700 hover:bg-gray-100'
								}`}
						>
							Dashboard
						</Link>
					</div>
				</div>

				<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
					<div className="flex-1">
						<div className="mb-2 flex items-center gap-3">
							<p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
								Statut: <span className="font-medium">{statusConfig[ticket.status].label}</span>
							</p>
							<p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
								Type: <span className={`font-medium ${priorityConfig[ticket.priority].color}`}>{priorityConfig[ticket.priority].label}</span>
							</p>
						</div>
						<h1 className={`mb-2 text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{ticket.title}</h1>
						<div className={`flex flex-wrap items-center gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
							<div className="flex items-center gap-2">
								<User className="h-4 w-4" />
								<span>
									Créé par <strong>{ticket.author.login || 'Unknown'}</strong>
								</span>
							</div>
							<div className="flex items-center gap-1">
								<Calendar className="h-4 w-4" />
								<span>{formatDate(ticket.createdAt)}</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="flex flex-col gap-4 p-4 md:flex-row md:p-6">
				<div className="flex-1 space-y-4">
					<div className={`rounded-xl border p-6 ${isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'}`}>
						<h2 className={`mb-4 text-lg font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Description</h2>
						<p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{ticket.description}</p>
					</div>

					<div className={`overflow-hidden rounded-xl border ${isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'}`}>
						<div className={`flex border-b ${isDark ? 'border-[#2a2a2a]' : 'border-gray-200'}`}>
							<button
								onClick={() => setActiveTab('responses')}
								className={`flex flex-1 items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === 'responses'
									? isDark
										? 'border-b-2 border-indigo-400 bg-[#242424] text-indigo-400'
										: 'border-b-2 border-indigo-600 bg-gray-50 text-indigo-600'
									: isDark
										? 'text-gray-400 hover:bg-[#1a1a1a]'
										: 'text-gray-600 hover:bg-gray-50'
									}`}
							>
								<MessagesSquare className="h-5 w-5" />
								Réponses ({responses.length})
							</button>
							<button
								onClick={() => setActiveTab('notes')}
								className={`flex flex-1 items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === 'notes'
									? isDark
										? 'border-b-2 border-indigo-400 bg-[#242424] text-indigo-400'
										: 'border-b-2 border-indigo-600 bg-gray-50 text-indigo-600'
									: isDark
										? 'text-gray-400 hover:bg-[#1a1a1a]'
										: 'text-gray-600 hover:bg-gray-50'
									}`}
							>
								<Lock className="h-5 w-5" />
								Notes internes ({notes.length})
							</button>
						</div>

						<div className="p-6">
							{activeTab === 'responses' ? (
								<div className="space-y-6">
									{!chatUnlocked && (
										<div className={`rounded-lg p-3 text-center text-sm ${isDark ? 'bg-yellow-600/10 text-yellow-400' : 'bg-yellow-50 text-yellow-700'}`}>
											⚠️ Le canal de messagerie s'ouvrira quand le statut sera "En cours".
										</div>
									)}

									{chatUnlocked && ticket.status !== TicketStatus.CLOSED && (
										<div className={`rounded-lg border p-4 ${isDark ? 'bg-[#121212] border-[#2a2a2a]' : 'bg-gray-50 border-gray-200'}`}>
											<div className="mb-3 flex items-center gap-2">
												<MessageSquare className={`h-5 w-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
												<span className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Répondre au client</span>
											</div>
											<textarea
												value={newResponse}
												onChange={(e) => setNewResponse(e.target.value)}
												placeholder="Écrivez votre réponse au client..."
												rows={3}
												className={`w-full resize-none rounded-lg border px-4 py-3 transition-colors ${isDark
													? 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-100 placeholder:text-gray-600 focus:border-indigo-500'
													: 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-indigo-600'
													} focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
											/>
											<div className="mt-3 flex justify-end">
												<button
													onClick={handleSendResponse}
													disabled={!newResponse.trim()}
													className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
												>
													<Send className="h-4 w-4" />
													Envoyer la réponse
												</button>
											</div>
										</div>
									)}

									<div className="space-y-4">
										{isLoadingMessages ? (
											<p className="text-center text-sm text-gray-500">Chargement...</p>
										) : responses.length === 0 ? (
											<p className={`text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
												Aucun message pour le moment.
											</p>
										) : (
											responses.map((response) => (
												<div
													key={response.id}
													className={`rounded-lg border p-4 ${response.isFromSupport
														? isDark
															? 'bg-indigo-600/5 border-indigo-600/20'
															: 'bg-indigo-50/50 border-indigo-200'
														: isDark
															? 'bg-[#121212] border-[#2a2a2a]'
															: 'bg-gray-50 border-gray-200'
														}`}
												>
													<div className="flex items-start gap-3">
														<div
															className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${response.isFromSupport ? 'bg-indigo-600/20 text-indigo-500' : 'bg-gray-200 text-gray-700'
																}`}
														>
															{response.author.login?.charAt(0).toUpperCase() ?? '?'}
														</div>
														<div className="flex-1">
															<div className="mb-1 flex items-center gap-2">
																<span className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
																	{response.author.login ?? response.author.email}
																</span>
																{response.isFromSupport && (
																	<span className={`rounded px-2 py-0.5 text-xs font-medium ${isDark ? 'bg-indigo-600/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>
																		Support
																	</span>
																)}
																<span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
																	{formatDateShort(response.createdAt)}
																</span>
															</div>
															<p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{response.content}</p>
														</div>
													</div>
												</div>
											))
										)}
										<div ref={messagesEndRef} />
									</div>
								</div>
							) : (
								<div className="space-y-6">
									<div className={`rounded-lg border p-4 ${isDark ? 'bg-[#121212] border-[#2a2a2a]' : 'bg-yellow-50/50 border-yellow-200'}`}>
										<div className="mb-3 flex items-center gap-2">
											<Lock className={`h-5 w-5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
											<span className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Ajouter une note interne</span>
										</div>
										<textarea
											value={newNote}
											onChange={(e) => setNewNote(e.target.value)}
											placeholder="Ajoutez une note privée pour l'équipe de support..."
											rows={3}
											className={`w-full resize-none rounded-lg border px-4 py-3 transition-colors ${isDark
												? 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-100 placeholder:text-gray-600 focus:border-yellow-500'
												: 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-yellow-600'
												} focus:outline-none focus:ring-2 focus:ring-yellow-500/20`}
										/>
										<div className="mt-3 flex justify-end">
											<button
												onClick={handleSendNote}
												disabled={!newNote.trim()}
												className="flex items-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 font-medium text-white transition-colors hover:bg-yellow-700 disabled:cursor-not-allowed disabled:opacity-50"
											>
												<Send className="h-4 w-4" />
												Ajouter la note
											</button>
										</div>
									</div>

									<div className="space-y-4">
										{notes.map((note) => (
											<div
												key={note.id}
												className={`rounded-lg border p-4 ${isDark ? 'bg-yellow-600/5 border-yellow-600/20' : 'bg-yellow-50/50 border-yellow-200'}`}
											>
												<div className="mb-1 flex items-center gap-2">
													<span className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{note.author}</span>
													<Lock className={`h-3 w-3 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
													<span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{formatDateShort(note.createdAt)}</span>
												</div>
												<p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{note.content}</p>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				<div className="w-full space-y-4 md:w-80">
					<div className={`rounded-xl border p-6 ${isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'}`}>
						<h3 className={`mb-4 font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Détails</h3>
						<div className="space-y-4">
							<div>
								<div className={`mb-2 flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									<Clock className="h-4 w-4" />
									<span className="font-medium">Statut actuel</span>
								</div>
								{/* <div className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 ${isDark ? statusConfig[ticket.status].colorDark : statusConfig[ticket.status].color}`}>
									<span className="font-medium">{statusConfig[ticket.status].label}</span>
								</div> */}
								<select
									value={selectedStatus}
									onChange={(e) => setSelectedStatus(e.target.value as TicketStatus)}
									className={`w-full rounded-lg border px-3 py-2 text-sm ${isDark
										? 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-100'
										: 'bg-white border-gray-300 text-gray-900'
										}`}
								>
									<option value={TicketStatus.OPEN}>Ouvert</option>
									<option value={TicketStatus.IN_PROGRESS}>En cours</option>
									<option value={TicketStatus.RESOLVED}>Résolu</option>
									<option value={TicketStatus.CLOSED}>Fermé</option>
								</select>
								<button
									type="button"
									onClick={handleUpdateStatus}
									disabled={isSavingStatus || selectedStatus === ticket.status}
									className="mt-2 w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
								>
									{isSavingStatus ? 'Mise a jour...' : 'Appliquer le statut'}
								</button>
							</div>
							<div>
								<div className={`mb-2 flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									<Tag className="h-4 w-4" />
									<span className="font-medium">Priorité</span>
								</div>
								<div className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 ${isDark ? priorityConfig[ticket.priority].bgDark : priorityConfig[ticket.priority].bg}`}>
									<AlertCircle className={`h-4 w-4 ${priorityConfig[ticket.priority].color}`} />
									<span className={`font-medium ${priorityConfig[ticket.priority].color}`}>{priorityConfig[ticket.priority].label}</span>
								</div>
							</div>
							<div>
								<div className={`mb-2 flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									<User className="h-4 w-4" />
									<span className="font-medium">Assigné à</span>
								</div>
								{ticket.assignedTo ? (
									<div className="flex items-center gap-2">
										<img src={ticket.assignedTo.avatar} alt={ticket.assignedTo.login || ''} className="h-8 w-8 rounded-full" />
										<div>
											<p className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{ticket.assignedTo.login}</p>
											<p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{ticket.assignedTo.email}</p>
										</div>
									</div>
								) : (
									<p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Non assigné</p>
								)}
							</div>
							<div>
								<div className={`mb-2 flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									<Calendar className="h-4 w-4" />
									<span className="font-medium">Date de création</span>
								</div>
								<p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{formatDate(ticket.createdAt)}</p>
							</div>
							<div>
								<div className={`mb-2 flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									<Clock className="h-4 w-4" />
									<span className="font-medium">Dernière mise à jour</span>
								</div>
								<p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{formatDate(ticket.updatedAt)}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ChatTicketView;