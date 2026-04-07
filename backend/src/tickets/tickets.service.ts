import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { TicketsGateway } from './tickets.gateway';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { TicketStatus, UserRole } from '@prisma/client';

@Injectable()
export class TicketsService {
	constructor(private prisma: PrismaService, private ticketsGateway: TicketsGateway) { }

	async createTicket(dto: CreateTicketDto, authorId: number) {
		const ticket = await this.prisma.ticket.create({
			data: {
				title: dto.title,
				description: dto.description,
				priority: dto.priority,
				authorId
			},
			include: { author: true }
		});
		this.ticketsGateway.emitNewTIcket(ticket);
		return ticket;
	}

	async getAllTickets() {
		return this.prisma.ticket.findMany({
			include: { author: true, AssignedTo: true }
		})
	}

	async getMyTickets(authorId: number) {
		return this.prisma.ticket.findMany({
			where: { authorId },
			include: { author: true, AssignedTo: true },
			orderBy: { createdAt: 'desc' },
		});
	}

	async updateTicketStatus(ticketId: number, dto: UpdateTicketStatusDto, agentId: number) {
		const ticket = await this.prisma.ticket.findUnique({
			where: { id: ticketId },
		});

		if (!ticket) {
			throw new NotFoundException('Ticket not found')
		}

		const actor = await this.prisma.user.findUnique({
			where: { id: agentId },
			select: { id: true, role: true },
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

		const updatedTicket = await this.prisma.ticket.update({
			where: { id: ticketId },
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
				...(shouldCloseChat ? { chatUnlocked: false } : {}),
			},
			include: { author: true, AssignedTo: true }
		});

		this.ticketsGateway.emitStatusTicket(updatedTicket);
		if (status === TicketStatus.CLOSED) {
			this.ticketsGateway.emitTicketClosed(ticketId);
		}
		return updatedTicket;
	}

	async getMessage(ticketId: number, userId: number, role: UserRole) {
		const ticket = await this.prisma.ticket.findUnique({
			where: { id: ticketId },
		});
		if (!ticket)
			throw new NotFoundException('TIcket not found');
		if (!ticket.chatUnlocked || ticket.status === TicketStatus.CLOSED)
			throw new ForbiddenException('Canal Message is closed');
		if (role === UserRole.CLIENT && ticket.authorId !== userId)
			throw new ForbiddenException('Accès interdit à ce ticket');
		return this.prisma.chatMessage.findMany({
			where: { ticketId },
			include: { author: true },
			orderBy: { createdAt: 'asc' },
		});
	}

	// 	async createMessage(ticketId: number, dto: CreateChatMessageDto, authorId: number) {
	// 		const ticket = await this.prisma.ticket.findUnique({
	// 			where: { id: ticketId },
	// 		});
	// 		if (!ticket)
	// 			throw new NotFoundException('Ticket not found');
	// 		if (!ticket.chatUnlocked || ticket.status === TicketStatus.CLOSED)
	// 			throw new ForbiddenException('Canal Message is closed');
	// 		const author = await this.prisma.user.findUnique({
	// 			where: { id: authorId },
	// 		});

	// 		if (!author) {
	// 			throw new ForbiddenException('Utilisateur invalide ou session expirée');
	// 		}
	// 		console.log('createMessage authorId=', authorId, 'ticketId=', ticketId);
	// 		const message = await this.prisma.chatMessage.create({
	// 			data: {
	// 				content: dto.content,
	// 				isFromSupport: dto.isFromSupport ?? false,
	// 				ticketId,
	// 				authorId,
	// 			},
	// 			include: { author: true },
	// 		});
	// 		this.ticketsGateway.emitNewMessage(ticketId, message);
	// 		return message;
	// 	}
	// }

	async createMessage(ticketId: number, dto: CreateChatMessageDto, authorId: number) {
		const ticket = await this.prisma.ticket.findUnique({
			where: { id: ticketId },
		});

		if (!ticket) throw new NotFoundException('Ticket not found');
		if (!ticket.chatUnlocked || ticket.status === TicketStatus.CLOSED) {
			throw new ForbiddenException('Canal Message is closed');
		}

		const author = await this.prisma.user.findUnique({
			where: { id: authorId },
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
				include: { author: true },
			});

			const unread = await tx.ticket.update({
				where: { id: ticketId },
				data: isSupportAuthor
					? { clientUnreadCount: { increment: 1 } }
					: { agentUnreadCount: { increment: 1 } },
				select: {
					id: true,
					clientUnreadCount: true,
					agentUnreadCount: true,
				},
			});

			return { message, unread };
		});

		this.ticketsGateway.emitNewMessage(ticketId, result.message);
		this.ticketsGateway.emitTicketUnreadUpdated(
			result.unread.id,
			result.unread.clientUnreadCount,
			result.unread.agentUnreadCount,
		);

		return result.message;
	}

	async markTicketMessagesAsRead(ticketId: number, userId: number, role: UserRole) {
		const ticket = await this.prisma.ticket.findUnique({
			where: { id: ticketId },
		});

		if (!ticket) throw new NotFoundException('Ticket not found');

		if (role === UserRole.CLIENT && ticket.authorId !== userId) {
			throw new ForbiddenException('Accès interdit à ce ticket');
		}

		const data =
			role === UserRole.CLIENT
				? { clientUnreadCount: 0 }
				: { agentUnreadCount: 0 };

		const updated = await this.prisma.ticket.update({
			where: { id: ticketId },
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
		);

		return updated;
	}
}