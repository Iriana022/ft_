import {useState, useEffect, useRef} from 'react';
import {Link, useLocation, useNavigate, useSearchParams} from 'react-router-dom';
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
import {TicketPriority, TicketStatus, type Ticket, type ChatMessage, type TicketInternalNote} from '../../types';
import {
	markTicketMessagesAsRead,
	updateTicketStatus,
	getTicketMessages,
	sendTicketMessage,
	fetchTicketById,
	normalizeTicket,
	getTicketInternalNotes,
	createTicketInternalNote,
	getTicketAssignedLabel,
	getTicketAuthorLabel,
	type RawTicket,
} from '../../services/tickets';
import {getSocket} from '../../services/singleton';
import {refreshSession} from '../../services/auth';
import {useTranslation} from 'react-i18next';

type LocationState = {
	ticket?: Ticket;
};

const DEFAULT_CLIENT_AVATAR = '/assets/avatars/avatar1.jpg';

const getResponseAvatar = (response: ChatMessage) => {
	const fallback = response.isFromSupport ? DEFAULT_AGENT_AVATAR : DEFAULT_CLIENT_AVATAR;
	return response.author?.avatar && response.author.avatar.length > 0
		? response.author.avatar
		: fallback;
};

const statusConfig = {
	[TicketStatus.OPEN]: {
		labelKey: 'statusOpen',
		color: 'bg-red-100 text-red-700 border-red-200',
		icon: AlertCircle,
	},
	[TicketStatus.IN_PROGRESS]: {
		labelKey: 'statusInProgress',
		color: 'bg-orange-100 text-orange-700 border-orange-200',
		icon: Clock,
	},
	[TicketStatus.RESOLVED]: {
		labelKey: 'statusResolved',
		color: 'bg-green-100 text-green-700 border-green-200',
		icon: CheckCircle2,
	},
	[TicketStatus.CLOSED]: {
		labelKey: 'statusClosed',
		color: 'bg-gray-100 text-gray-700 border-gray-200',
		icon: CheckCircle2,
	},
};

const DEFAULT_AGENT_AVATAR = '/assets/avatars/avatar2.png';

const priorityConfig = {
	[TicketPriority.LOW]: {labelKey: 'priorityLow', color: 'text-green-600', bg: 'bg-green-50'},
	[TicketPriority.MEDIUM]: {labelKey: 'priorityMedium', color: 'text-blue-600', bg: 'bg-blue-50'},
	[TicketPriority.HIGH]: {labelKey: 'priorityHigh', color: 'text-orange-600', bg: 'bg-orange-50'},
	[TicketPriority.URGENT]: {labelKey: 'priorityUrgent', color: 'text-red-600', bg: 'bg-red-50'},
};

function ChatTicketView() {
	const {t, i18n} = useTranslation('chat');
	const navigate = useNavigate();
	const location = useLocation() as {state?: LocationState};
	const [searchParams] = useSearchParams();
	const [currentUserId, setCurrentUserId] = useState<number | null>(null);
	const [activeTab, setActiveTab] = useState<'responses' | 'notes'>('responses');
	const [newResponse, setNewResponse] = useState('');
	const [newNote, setNewNote] = useState('');

	const fallbackId = Number(searchParams.get('ticketId') ?? '0') || 0;
	const fallbackTicket: Ticket = {
		id: fallbackId,
		title: t('ticketFallbackTitle'),
		description: t('ticketFallbackDescription'),
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

	const [notes, setNotes] = useState<TicketInternalNote[]>([]);


	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
	};

	const [chatUnlocked, setChatUnlocked] = useState(
		initialTicket.status === TicketStatus.IN_PROGRESS
	);
	const isTicketHandledByAnotherAgent =
		ticket.status !== TicketStatus.CLOSED &&
		ticket.assignedToId !== undefined &&
		ticket.assignedToId !== null &&
		currentUserId !== null &&
		ticket.assignedToId !== currentUserId;
	const canViewResponses =
		ticket.status !== TicketStatus.CLOSED && !isTicketHandledByAnotherAgent;
	const canUseResponses =
		chatUnlocked &&
		ticket.status !== TicketStatus.CLOSED &&
		!isTicketHandledByAnotherAgent;


	const isInternalNotesLocked =
		ticket.status === TicketStatus.IN_PROGRESS &&
		ticket.assignedToId !== undefined &&
		ticket.assignedToId !== null &&
		currentUserId !== null &&
		ticket.assignedToId !== currentUserId;

	const canViewInternalNotes = !isInternalNotesLocked;

	const isClosedTicket = ticket.status === TicketStatus.CLOSED;

	useEffect(() => {
		let mounted = true;

		void refreshSession().then((user) => {
			if (!mounted) return;
			setCurrentUserId(user?.userId ?? null);
		});

		return () => {
			mounted = false;
		};
	}, []);


	useEffect(() => {
		if (!ticket.id) return;

		if (!canViewInternalNotes) {
			setNotes([]);
			return;
		}

		const loadNotes = async () => {
			try {
				const data = await getTicketInternalNotes(ticket.id);
				setNotes(data);
			} catch (error: any) {
				if (error?.response?.status === 403) {
					setNotes([]);
					return;
				}
				console.error('Erreur chargement notes internes:', error);
			}
		};

		loadNotes();
	}, [ticket.id, canViewInternalNotes]);

	useEffect(() => {
		if (!ticket.id) return;
		if (!canViewInternalNotes) return;

		const socket = getSocket();

		const joinInternal = () => {
			socket.emit('joinInternalNotes', {ticketId: ticket.id});
		};

		const onInternalNoteCreated = (note: TicketInternalNote) => {
			if (note.ticketId !== ticket.id) return;

			setNotes((prev) => {
				if (prev.some((n) => n.id === note.id)) return prev;
				return [...prev, {...note, createdAt: new Date(note.createdAt)}];
			});
		};

		socket.on('connect', joinInternal);
		socket.on('ticketInternalNoteCreated', onInternalNoteCreated);

		if (socket.connected) joinInternal();

		return () => {
			socket.emit('leaveInternalNotes', {ticketId: ticket.id});
			socket.off('connect', joinInternal);
			socket.off('ticketInternalNoteCreated', onInternalNoteCreated);
		};
	}, [ticket.id, canViewInternalNotes]);

	useEffect(() => {
		if (!fallbackId) return;

		let mounted = true;

		const loadFreshTicket = async () => {
			try {
				const freshTicket = await fetchTicketById(fallbackId);
				if (!mounted) return;

				setTicket(freshTicket);
				setSelectedStatus(freshTicket.status);
			} catch (error) {
				console.error('Erreur chargement ticket:', error);
			}
		};

		loadFreshTicket();

		return () => {
			mounted = false;
		};
	}, [fallbackId]);

	useEffect(() => {
		setChatUnlocked(ticket.status === TicketStatus.IN_PROGRESS);
	}, [ticket.status]);

	useEffect(() => {
		scrollToBottom();
	}, [responses]);

	useEffect(() => {
		setSelectedStatus(ticket.status);
	}, [ticket.status]);

	useEffect(() => {
		if (!ticket.id) return;

		const socket = getSocket();

		const onTicketStatusUpdated = (payload: RawTicket) => {
			const updatedTicket = normalizeTicket(payload);
			if (updatedTicket.id !== ticket.id) return;

			setTicket(updatedTicket);

			if (updatedTicket.status === TicketStatus.CLOSED) {
				setResponses([]);
				setNewResponse('');
			}
		};

		const onTicketDeleted = (payload?: {ticketId?: number}) => {
			if (payload?.ticketId !== ticket.id) return;
			navigate(-1);
		};

		socket.on('ticketStatusUpdated', onTicketStatusUpdated);
		socket.on('ticketDeleted', onTicketDeleted);

		return () => {
			socket.off('ticketStatusUpdated', onTicketStatusUpdated);
			socket.off('ticketDeleted', onTicketDeleted);
		};
	}, [ticket.id, navigate]);
	useEffect(() => {
		if (!ticket.id)
			return;
		if (!canViewResponses)
			return;
		markTicketMessagesAsRead(ticket.id).catch((error: any) => {
			const status = error?.response?.status;
			if (status === 403)
				return;
			console.log('Erreur reset unread agent:', error);
		});
	}, [ticket.id, canViewResponses]);

	useEffect(() => {
		if (!canViewResponses) {
			setResponses([]);
			setIsLoadingMessages(false);
			return;
		}
		setIsLoadingMessages(true);
		const loadMessages = async () => {
			try {
				const data = await getTicketMessages(ticket.id);
				setResponses(data);
			} catch (error: any) {
				const status = error?.response?.status;
				if (status === 403) {
					setResponses([]);
					return;
				}
				console.error('Erreur chargement messages:', error);
			} finally {
				setIsLoadingMessages(false);
			}
		};
		loadMessages();

		const socket = getSocket();

		const joinRoom = () => {
			socket.emit('joinTicket', {ticketId: ticket.id});
		};

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
			if (!message.isFromSupport && !isTicketHandledByAnotherAgent) {
				markTicketMessagesAsRead(ticket.id).catch(() => {});
			}
		};


		socket.on('connect', joinRoom);
		socket.on('newMessage', onNewMessage);
		if (socket.connected)
			joinRoom();
		return () => {
			socket.emit('leaveTicket', {ticketId: ticket.id});
			socket.off('connect', joinRoom);
			socket.off('newMessage', onNewMessage);
		};
	}, [ticket.id, canViewResponses, isTicketHandledByAnotherAgent]);

	const formatDate = (dateValue: Date | string) => {
		const date = new Date(dateValue);
		return new Intl.DateTimeFormat(i18n.language, {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		}).format(date);
	};

	const formatDateShort = (dateValue: Date | string) => {
		const date = new Date(dateValue);
		return new Intl.DateTimeFormat(i18n.language, {
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit',
		}).format(date);
	};

	const handleSendResponse = async () => {
		if (!newResponse.trim() || !canUseResponses) return;

		try {
			const created = await sendTicketMessage(ticket.id, newResponse, true);

			setResponses((prev) => {
				if (prev.some((m) => m.id === created.id)) return prev;
				return [...prev, created];
			});

			setNewResponse('');
		} catch (error: any) {
			console.error('Erreur envoi message:', error?.response?.data ?? error);
		}
	};
	const handleSendNote = async () => {
		if (!newNote.trim()) return;
		if (!canViewInternalNotes) return;

		try {
			const created = await createTicketInternalNote(ticket.id, newNote.trim());
			setNotes((prev) => {
				if (prev.some((n) => n.id === created.id)) return prev;
				return [...prev, created];
			});
			setNewNote('');
		} catch (error: any) {
			if (error?.response?.status === 403) return;
			console.error('Erreur creation note interne:', error);
		}
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
		<div className="min-h-screen bg-cream">
			<div className="border-b px-4 py-4 md:px-8 bg-white border-gray-200">
				<div className="flex items-center justify-between">
					< button
						onClick={() => navigate(-1)
						}
						className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900"
					>
						<ArrowLeft className="h-5 w-5" />
						<span className="font-medium">{t('back')}</span>
					</button >
					<div className="flex items-center gap-2">
						<Link
							to="/agent"
							className="rounded-lg border px-3 py-2 text-sm font-medium transition-colors border-gray-300 text-gray-700 hover:bg-gray-100"
						>
							{t('dashboard')}
						</Link>
					</div>
				</div>

				<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
					<div className="flex-1">
						<div className="mb-2 flex items-center gap-3">
							<p className="text-xs text-gray-600">
								{t('status')}: <span className="font-medium">{t(statusConfig[ticket.status].labelKey)}</span>
							</p>
							<p className="text-xs text-gray-600">
								{t('type')}: <span className={`font-medium ${priorityConfig[ticket.priority].color}`}>{t(priorityConfig[ticket.priority].labelKey)}</span>
							</p>
						</div>
						<h1 className="mb-2 text-2xl font-bold text-gray-900">{ticket.title}</h1>
						<div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
							<div className="flex items-center gap-2">
								<User className="h-4 w-4" />
								<span>
									{t('createdBy')} <strong>{getTicketAuthorLabel(ticket, t('deletedUser'))}</strong>
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
					<div className="rounded-xl border p-6 bg-white border-gray-200">
						<h2 className="mb-4 text-lg font-bold text-gray-900">{t('description')}</h2>
						<p className="text-gray-700">{ticket.description}</p>
					</div>

					<div className="overflow-hidden rounded-xl border bg-white border-gray-200">
						<div className="flex border-b border-gray-200">
							<button
								onClick={() => setActiveTab('responses')}
								className={`flex flex-1 items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === 'responses'
									? 'border-b-2 border-navy bg-gray-50 text-navy'
									: 'text-gray-600 hover:bg-gray-50'
									}`}
							>
								<MessagesSquare className="h-5 w-5" />
								{t('responses')} ({responses.length})
							</button>
							<button
								onClick={() => setActiveTab('notes')}
								className={`flex flex-1 items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === 'notes'
									? 'border-b-2 border-navy bg-gray-50 text-navy'
									: 'text-gray-600 hover:bg-gray-50'
									}`}
							>
								<Lock className="h-5 w-5" />
								{t('internalNotes')} ({notes.length})
							</button>
						</div>

						<div className="p-6">
							{activeTab === 'responses' ? (
								isTicketHandledByAnotherAgent ? (
									<div className="rounded-lg p-3 text-center text-sm bg-red-50 text-red-700">
										{t('ticketHandledByAnotherAgent')}
									</div>
								) : (
									<div className="space-y-6">
										{ticket.status === TicketStatus.OPEN && (
											<div className="rounded-lg p-3 text-center text-sm bg-yellow-50 text-yellow-700">
												{t('messagingOpensWhenInProgress')}
											</div>
										)}
										{ticket.status === TicketStatus.RESOLVED && (
											<div className="rounded-lg p-3 text-center text-sm bg-blue-50 text-blue-700">
												{t('resolvedHint')}
											</div>
										)}
										{ticket.status === TicketStatus.CLOSED && (
											<div className="rounded-lg p-3 text-center text-sm bg-gray-100 text-gray-700">
												{t('closedHint')}
											</div>
										)}

										{canUseResponses && (
											<div className="rounded-lg border p-4 bg-gray-50 border-gray-200">
												<div className="mb-3 flex items-center gap-2">
													<MessageSquare className="h-5 w-5 text-indigo-600" />
													<span className="font-semibold text-gray-900">{t('replyToClient')}</span>
												</div>
												<textarea
													value={newResponse}
													onChange={(e) => setNewResponse(e.target.value)}
													placeholder={t('responsePlaceholder')}
													rows={3}
													className="w-full resize-none rounded-lg border px-4 py-3 transition-colors bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
												/>
												<div className="mt-3 flex justify-end">
													<button
														onClick={handleSendResponse}
														disabled={!newResponse.trim()}
														className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
													>
														<Send className="h-4 w-4" />
														{t('sendResponse')}
													</button>
												</div>
											</div>
										)}

										<div className="space-y-4">
											{isLoadingMessages ? (
												<p className="text-center text-sm text-gray-500">{t('loadingMessages')}</p>
											) : responses.length === 0 ? (
												<p className="text-center text-sm text-gray-500">{t('noMessagesYet')}</p>
											) : (
												responses.map((response) => (
													<div
														key={response.id}
														className={`rounded-lg border p-4 ${response.isFromSupport
															? 'bg-indigo-50/50 border-indigo-200'
															: 'bg-gray-50 border-gray-200'
															}`}
													>
														<div className="flex items-start gap-3">
															<img
																src={getResponseAvatar(response)}
																alt={response.author?.login ?? response.author?.email ?? t('deletedUser')}
																className="h-10 w-10 rounded-full object-cover border border-gray-200 bg-gray-100"
																onError={(e) => {
																	e.currentTarget.src = response.isFromSupport
																		? DEFAULT_AGENT_AVATAR
																		: DEFAULT_CLIENT_AVATAR;
																}}
															/>
															<div className="flex-1">
																<div className="mb-1 flex items-center gap-2">
																	<span className="font-semibold text-gray-900">
																		{response.author?.login ?? response.author?.email ?? t('deletedUser')}
																	</span>
																	{response.isFromSupport && (
																		<span className="rounded px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700">
																			{t('supportBadge')}
																		</span>
																	)}
																	<span className="text-sm text-gray-500">
																		{formatDateShort(response.createdAt)}
																	</span>
																</div>
																<p className="text-gray-700">{response.content}</p>
															</div>
														</div>
													</div>
												))
											)}
											<div ref={messagesEndRef} />
										</div>
									</div>
								)
							) : (
								isInternalNotesLocked ? (
									<div className="rounded-lg p-3 text-center text-sm bg-red-50 text-red-700">
										{t('internalNotesLocked')}
									</div>
								) : (
									<div className="space-y-6">
										<div className="rounded-lg border p-4 bg-yellow-50/50 border-yellow-200">
											<div className="mb-3 flex items-center gap-2">
												<Lock className="h-5 w-5 text-yellow-600" />
												<span className="font-semibold text-gray-900">{t('addInternalNote')}</span>
											</div>
											<textarea
												value={newNote}
												onChange={(e) => setNewNote(e.target.value)}
												placeholder={t('notePlaceholder')}
												rows={3}
												className="w-full resize-none rounded-lg border px-4 py-3 transition-colors bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
											/>
											<div className="mt-3 flex justify-end">
												<button
													onClick={handleSendNote}
													disabled={!newNote.trim()}
													className="flex items-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 font-medium text-white transition-colors hover:bg-yellow-700 disabled:cursor-not-allowed disabled:opacity-50"
												>
													<Send className="h-4 w-4" />
													{t('addNote')}
												</button>
											</div>
										</div>

										<div className="space-y-4">
											{notes.map((note) => (
												<div key={note.id} className="rounded-lg border p-4 bg-yellow-50/50 border-yellow-200">
													<div className="mb-1 flex items-center gap-2">
														<span className="font-semibold text-gray-900">{note.author?.login ?? note.author?.email ?? t('deletedUser')}</span>
														<Lock className="h-3 w-3 text-yellow-600" />
														<span className="text-sm text-gray-500">{formatDateShort(note.createdAt)}</span>
													</div>
													<p className="text-gray-700">{note.content}</p>
												</div>
											))}
										</div>
									</div>
								)
							)}
						</div>
					</div>
				</div>

				<div className="w-full space-y-4 md:w-80">
					<div className="rounded-xl border p-6 bg-white border-gray-200">
						<h3 className="mb-4 font-bold text-gray-900">{t('details')}</h3>
						<div className="space-y-4">
							<div>
								<div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
									<Clock className="h-4 w-4" />
									<span className="font-medium">{t('currentStatus')}</span>
								</div>
								<select
									value={selectedStatus}
									onChange={(e) => setSelectedStatus(e.target.value as TicketStatus)}
									disabled={isTicketHandledByAnotherAgent || isClosedTicket}
									className="w-full rounded-lg border px-3 py-2 text-sm bg-white border-gray-300 text-gray-900"
								>
									<option value={TicketStatus.OPEN}>{t('statusOpen')}</option>
									<option value={TicketStatus.IN_PROGRESS}>{t('statusInProgress')}</option>
									<option value={TicketStatus.RESOLVED}>{t('statusResolved')}</option>
									<option value={TicketStatus.CLOSED}>{t('statusClosed')}</option>
								</select>
								<button
									type="button"
									onClick={handleUpdateStatus}
									disabled={isTicketHandledByAnotherAgent || isClosedTicket || isSavingStatus || selectedStatus === ticket.status}
									className="mt-2 w-full rounded-lg bg-navy px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
								>
									{isSavingStatus ? t('updatingStatus') : t('updateStatus')}
								</button>
								{isClosedTicket && (
									<p className="mt-2 text-xs text-red-600">
										{t('closedImmutable')}
									</p>
								)}
							</div>
							<div>
								<div className="mb-2 flex items-center gap-2 text-sm text-gray-599">
									<Tag className="h-4 w-4" />
									<span className="font-medium">{t('priority')}</span>
								</div>
								<div className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 ${priorityConfig[ticket.priority].bg}`}>
									<AlertCircle className={`h-4 w-4 ${priorityConfig[ticket.priority].color}`} />
									<span className={`font-medium ${priorityConfig[ticket.priority].color}`}>{t(priorityConfig[ticket.priority].labelKey)}</span>
								</div>
							</div>
							<div>
								<div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
									<User className="h-4 w-4" />
									<span className="font-medium">{t('assignedTo')}</span>
								</div>
								{ticket.assignedTo ? (
									<div className="flex items-center gap-2">
										<img src={ticket.assignedTo.avatar || DEFAULT_AGENT_AVATAR}
											alt={ticket.assignedTo.login || ''}
											className="h-8 w-8 rounded-full"
											onError={(e) => {
												e.currentTarget.src = DEFAULT_AGENT_AVATAR;
											}} />
										<div>
											<p className="font-medium text-gray-900">{ticket.assignedTo.login}</p>
											<p className="text-xs text-gray-500">{ticket.assignedTo.email}</p>
										</div>
									</div>
								) : (
									<p className="text-sm text-gray-500">{getTicketAssignedLabel(ticket, t('unassigned'), t('deletedAgent'))}</p>
								)}
							</div>
							<div>
								<div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
									<Calendar className="h-4 w-4" />
									<span className="font-medium">{t('createdAt')}</span>
								</div>
								<p className="text-sm text-gray-700">{formatDate(ticket.createdAt)}</p>
							</div>
							<div>
								<div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
									<Clock className="h-4 w-4" />
									<span className="font-medium">{t('updatedAt')}</span>
								</div>
								<p className="text-sm text-gray-700">{formatDate(ticket.updatedAt)}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ChatTicketView;
