import {Injectable, NotFoundException, ForbiddenException} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';
import {CreateTicketDto} from './dto/create-ticket.dto';
import {UpdateTicketStatusDto} from './dto/update-ticket-status.dto';
import {TicketsGateway} from './tickets.gateway';
import {CreateChatMessageDto} from './dto/create-chat-message.dto';
import {TicketStatus, UserRole} from '@prisma/client';
import {CreateInternalNoteDto} from './dto/create-internal-note.dto';

@Injectable()
export class TicketsService {
	constructor(private prisma: PrismaService, private ticketsGateway: TicketsGateway) {}

	private assertTicketMessageAccess(
		ticket: {authorId: number; AssignedToId: number | null},
		userId: number,
		role: UserRole,
	) {
		if (role === UserRole.ADMIN) return;

		if (role === UserRole.CLIENT) {
			if (ticket.authorId !== userId) {
				throw new ForbiddenException('Accès interdit à ce ticket');
			}
			return;
		}

		if (role === UserRole.AGENT) {
			if (ticket.AssignedToId !== null && ticket.AssignedToId !== userId) {
				throw new ForbiddenException('Messages réservés à l agent assigné');
			}
			return;
		}

		throw new ForbiddenException('Accès interdit');
	}

	private assertInternalNoteAccess(
		ticket: {AssignedToId: number | null; status: TicketStatus},
		userId: number,
		role: UserRole,
	) {
		if (role === UserRole.ADMIN) return;

		if (role !== UserRole.AGENT) {
			throw new ForbiddenException('Notes internes reservees aux agents');
		}

		const lockedForOtherAgents =
			ticket.status === TicketStatus.IN_PROGRESS &&
			ticket.AssignedToId !== null &&
			ticket.AssignedToId !== userId;

		if (lockedForOtherAgents) {
			throw new ForbiddenException(
				'Notes internes indisponibles pendant la prise en charge par l agent assigne',
			);
		}
	}

	async getInternalNotes(ticketId: number, userId: number, role: UserRole) {
		const ticket = await this.prisma.ticket.findUnique({
			where: {id: ticketId},
			select: {id: true, AssignedToId: true, status: true},
		});

		if (!ticket) throw new NotFoundException('Ticket not found');

		this.assertInternalNoteAccess(ticket, userId, role);

		return this.prisma.ticketInternalNote.findMany({
			where: {ticketId},
			include: {author: true},
			orderBy: {createdAt: 'asc'},
		});
	}

	async createInternalNote(
		ticketId: number,
		dto: CreateInternalNoteDto,
		userId: number,
		role: UserRole,
	) {
		const ticket = await this.prisma.ticket.findUnique({
			where: {id: ticketId},
			select: {id: true, AssignedToId: true, status: true},
		});

		if (!ticket) throw new NotFoundException('Ticket not found');

		this.assertInternalNoteAccess(ticket, userId, role);

		const note = await this.prisma.ticketInternalNote.create({
			data: {
				content: dto.content,
				ticketId,
				authorId: userId,
			},
			include: {author: true},
		});

		this.ticketsGateway.emitInternalNoteCreated(ticketId, note);

		return note;
	}

	async createTicket(dto: CreateTicketDto, authorId: number) {
		const ticket = await this.prisma.ticket.create({
			data: {
				title: dto.title,
				description: dto.description,
				priority: dto.priority,
				authorId
			},
			include: {author: true}
		});
		this.ticketsGateway.emitNewTIcket(ticket);
		if (ticket.author.role === UserRole.CLIENT) {
			void this.ticketsGateway.emitSupportNotificationNewClientTicket({
				ticketId: ticket.id,
				ticketTitle: ticket.title,
				userLogin: ticket.author.login ?? ticket.author.email,
			});
		}
		return ticket;
	}

	async getAllTickets() {
		return this.prisma.ticket.findMany({
			include: {author: true, AssignedTo: true}
		})
	}

	async getMyTickets(authorId: number) {
		return this.prisma.ticket.findMany({
			where: {authorId},
			include: {author: true, AssignedTo: true},
			orderBy: {createdAt: 'desc'},
		});
	}

	async getTicketResolutionHistory(days: number, role: UserRole) {
		if (role !== UserRole.ADMIN) {
			throw new ForbiddenException('Accès réservé aux administrateurs');
		}

		const safeDays = Number.isFinite(days) ? Math.max(1, Math.min(days, 365)) : 7;
		const since = new Date();
		since.setHours(0, 0, 0, 0);
		since.setDate(since.getDate() - (safeDays - 1));

		return this.prisma.ticketStatusHistory.findMany({
			where: {
				toStatus: TicketStatus.RESOLVED,
				changedAt: {gte: since},
			},
			select: {
				ticketId: true,
				toStatus: true,
				changedAt: true,
			},
			orderBy: {changedAt: 'asc'},
		});
	}

	async updateTicketStatus(ticketId: number, dto: UpdateTicketStatusDto, agentId: number) {
		const ticket = await this.prisma.ticket.findUnique({
			where: {id: ticketId},
		});

		if (!ticket)
			throw new NotFoundException('Ticket not found')

		if (ticket.status === TicketStatus.CLOSED)
			throw new ForbiddenException('This ticket is definitively closed');

		const actor = await this.prisma.user.findUnique({
			where: {id: agentId},
			select: {id: true, role: true},
		});

		if (!actor || (actor.role !== UserRole.AGENT && actor.role !== UserRole.ADMIN)) {
			throw new ForbiddenException('Seuls les agents peuvent mettre à jour ce ticket');
		}

		const isAssignedToAnotherAgent =
			ticket.status === TicketStatus.IN_PROGRESS &&
			ticket.AssignedToId !== null &&
			ticket.AssignedToId !== agentId;

		if (isAssignedToAnotherAgent && actor.role !== UserRole.ADMIN) {
			throw new ForbiddenException('Ce ticket est déjà pris en charge par un autre agent');
		}

		const status = dto.status as TicketStatus;
		const shouldUnlockChat = status === TicketStatus.IN_PROGRESS;
		const shouldCloseChat = status === TicketStatus.CLOSED;
		const shouldReopenTicket = status === TicketStatus.OPEN;

		const updatedTicket = await this.prisma.$transaction(async (t) => {
			const updated = await t.ticket.update({
				where: {id: ticketId},
				data: {
					status: dto.status as never,
					...(shouldUnlockChat ? {
						chatUnlocked: true,
						AssignedToId: agentId
					} : {}),
					...(shouldReopenTicket ? {
						chatUnlocked: false,
						AssignedToId: null,
					} : {}),
					...(shouldCloseChat ? {
						chatUnlocked: false,
						clientUnreadCount: 0,
						agentUnreadCount: 0
					} : {}),
				},
				include: {author: true, AssignedTo: true}
			});
			if (ticket.status !== status) {
				await t.ticketStatusHistory.create({
					data: {
						ticketId,
						fromStatus: ticket.status,
						toStatus: status,
						changedById: agentId,
					},
				});
			}
			if (shouldCloseChat) {
				await t.chatMessage.deleteMany({
					where: {ticketId},
				});
			}
			return updated;
		});

		this.ticketsGateway.emitStatusTicket(updatedTicket);
		if (ticket.status !== status && updatedTicket.author.role === UserRole.CLIENT) {
			void this.ticketsGateway.emitTicketStatusChangedNotification({
				clientUserId: updatedTicket.authorId,
				clientLogin: updatedTicket.author.login ?? updatedTicket.author.email,
				ticketId: updatedTicket.id,
				fromStatus: ticket.status,
				toStatus: status,
			});
		}

		if (status === TicketStatus.CLOSED) {
			this.ticketsGateway.emitTicketUnreadUpdated(ticketId, 0, 0, {
				authorId: updatedTicket.authorId,
				assignedToId: updatedTicket.AssignedToId,
			});
			this.ticketsGateway.emitTicketClosed(ticketId);
		}
		return updatedTicket;
	}

	async getMessage(ticketId: number, userId: number, role: UserRole) {
		const ticket = await this.prisma.ticket.findUnique({
			where: {id: ticketId},
			select: {
				id: true,
				authorId: true,
				AssignedToId: true,
			},
		});
		if (!ticket)
			throw new NotFoundException('Ticket not found');
		this.assertTicketMessageAccess(ticket, userId, role);

		return this.prisma.chatMessage.findMany({
			where: {ticketId},
			include: {author: true},
			orderBy: {createdAt: 'asc'},
		});
	}


	async createMessage(ticketId: number, dto: CreateChatMessageDto, authorId: number) {
		const ticket = await this.prisma.ticket.findUnique({
			where: {id: ticketId},
		});

		if (!ticket) throw new NotFoundException('Ticket not found');
		if (!ticket.chatUnlocked || ticket.status === TicketStatus.CLOSED) {
			throw new ForbiddenException('Canal Message is closed');
		}

		const author = await this.prisma.user.findUnique({
			where: {id: authorId},
		});

		if (!author) {
			throw new ForbiddenException('Utilisateur invalide ou session expirée');
		}

		const isSupportAuthor = author.role === UserRole.AGENT || author.role === UserRole.ADMIN;
		const isAssignedToAnotherAgent =
			isSupportAuthor &&
			author.role !== UserRole.ADMIN &&
			ticket.status === TicketStatus.IN_PROGRESS &&
			ticket.AssignedToId !== null &&
			ticket.AssignedToId !== authorId;

		if (isAssignedToAnotherAgent) {
			throw new ForbiddenException('Ce ticket est déjà pris en charge par un autre agent');
		}

		const result = await this.prisma.$transaction(async (tx) => {
			const message = await tx.chatMessage.create({
				data: {
					content: dto.content,
					isFromSupport: isSupportAuthor,
					ticketId,
					authorId,
				},
				include: {author: true},
			});

			const unread = await tx.ticket.update({
				where: {id: ticketId},
				data: isSupportAuthor
					? {clientUnreadCount: {increment: 1}}
					: {agentUnreadCount: {increment: 1}},
				select: {
					id: true,
					clientUnreadCount: true,
					agentUnreadCount: true,
				},
			});

			return {message, unread};
		});

		this.ticketsGateway.emitNewMessage(ticketId, result.message);
		this.ticketsGateway.emitTicketUnreadUpdated(
			result.unread.id,
			result.unread.clientUnreadCount,
			result.unread.agentUnreadCount,
			{
				authorId: ticket.authorId,
				assignedToId: ticket.AssignedToId,
			},
		);

		return result.message;
	}

	async markTicketMessagesAsRead(ticketId: number, userId: number, role: UserRole) {
		const ticket = await this.prisma.ticket.findUnique({
			where: {id: ticketId},
			select: {
				id: true,
				authorId: true,
				AssignedToId: true,
			},
		});

		if (!ticket) throw new NotFoundException('Ticket not found');

		this.assertTicketMessageAccess(ticket, userId, role);

		const data =
			role === UserRole.CLIENT
				? {clientUnreadCount: 0}
				: {agentUnreadCount: 0};

		const updated = await this.prisma.ticket.update({
			where: {id: ticketId},
			data,
			select: {
				id: true,
				clientUnreadCount: true,
				agentUnreadCount: true,
			},
		});

		this.ticketsGateway.emitTicketUnreadUpdated(
			updated.id,
			updated.clientUnreadCount,
			updated.agentUnreadCount,
			{
				authorId: ticket.authorId,
				assignedToId: ticket.AssignedToId,
			},
		);

		return updated;
	}
}
