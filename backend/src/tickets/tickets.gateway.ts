import {
    WebSocketGateway, WebSocketServer, OnGatewayConnection,
    OnGatewayDisconnect, SubscribeMessage, MessageBody, ConnectedSocket, WsException
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationCode, TicketStatus, UserRole } from '@prisma/client';

type SystemNotificationCode =
    | 'NEW_CLIENT_TICKET'
    | 'USER_PROFILE_UPDATED'
    | 'USER_LOGGED_IN'
    | 'TICKET_STATUS_UPDATED';

type SystemNotificationEvent = {
    id: number;
    code: SystemNotificationCode;
    createdAt: string;
    readAt: string | null;
    data: {
        ticketId?: number;
        ticketTitle?: string;
        userLogin?: string;
        userRole?: UserRole;
        fromStatus?: TicketStatus;
        toStatus?: TicketStatus;
        clientLogin?: string;
    };
};

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    path: '/socket.io'
})

export class TicketsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    handleConnection(client: Socket) {
        console.log(`Client connected : ${client.id}`);
    }
    handleDisconnect(client: Socket) {
        console.log(`Client disconnected : ${client.id}`);
    }

    private roleRoom(role: UserRole): string {
        return 'role-' + String(role).toLowerCase();
    }

    private userRoom(userId: number): string {
        return 'user-' + userId;
    }

    @SubscribeMessage('registerRoleChannel')
    async handleRegisterRoleChannel(
        @MessageBody() data: { token?: string },
        @ConnectedSocket() client: Socket,
    ) {
        const user = await this.resolveUserFromToken(data.token);

        for (const room of client.rooms) {
            if (room.startsWith('role-')) {
                client.leave(room);
            }
        }

        client.join(this.roleRoom(user.role));
        client.join(this.userRoom(user.userId));
    }

    private async emitSystemNotificationToUsers(
        userIds: number[],
        event: Omit<SystemNotificationEvent, 'id' | 'createdAt' | 'readAt'>,
    ) {
        const uniqueIds = [...new Set(userIds)];

        for (const recipientId of uniqueIds) {
            const created = await this.prisma.notification.create({
                data: {
                    recipientId,
                    code: event.code as NotificationCode,
                    payload: event.data ?? {},
                },
            });

            this.server.to(this.userRoom(recipientId)).emit('systemNotification', {
                id: created.id,
                code: created.code,
                createdAt: created.createdAt.toISOString(),
                readAt: created.readAt ? created.readAt.toISOString() : null,
                data: created.payload,
            } as SystemNotificationEvent);
        }
    }

    private async emitSystemNotificationToRoles(
        roles: UserRole[],
        event: Omit<SystemNotificationEvent, 'id' | 'createdAt' | 'readAt'>,
    ) {
        const recipients = await this.prisma.user.findMany({
            where: { role: { in: roles } },
            select: { id: true },
        });

        await this.emitSystemNotificationToUsers(
            recipients.map((u) => u.id),
            event,
        );
    }

    async emitSupportNotificationNewClientTicket(data: {
        ticketId: number;
        ticketTitle: string;
        userLogin: string;
    }) {
        await this.emitSystemNotificationToRoles(
            [UserRole.AGENT, UserRole.ADMIN],
            {
                code: 'NEW_CLIENT_TICKET',
                data: {
                    ticketId: data.ticketId,
                    ticketTitle: data.ticketTitle,
                    userLogin: data.userLogin,
                },
            },
        );
    }

    async emitAdminNotificationUserProfileUpdated(data: {
        userLogin: string;
        userRole: UserRole;
    }) {
        await this.emitSystemNotificationToRoles(
            [UserRole.ADMIN],
            {
                code: 'USER_PROFILE_UPDATED',
                data: {
                    userLogin: data.userLogin,
                    userRole: data.userRole,
                },
            },
        );
    }

    async emitAdminNotificationUserLoggedIn(data: {
        userLogin: string;
        userRole: UserRole;
    }) {
        await this.emitSystemNotificationToRoles(
            [UserRole.ADMIN],
            {
                code: 'USER_LOGGED_IN',
                data: {
                    userLogin: data.userLogin,
                    userRole: data.userRole,
                },
            },
        );
    }

    async emitTicketStatusChangedNotification(data: {
        clientUserId: number;
        clientLogin: string;
        ticketId: number;
        fromStatus: TicketStatus;
        toStatus: TicketStatus;
    }) {
        await this.emitSystemNotificationToUsers(
            [data.clientUserId],
            {
                code: 'TICKET_STATUS_UPDATED',
                data: {
                    ticketId: data.ticketId,
                    fromStatus: data.fromStatus,
                    toStatus: data.toStatus,
                },
            },
        );

        await this.emitSystemNotificationToRoles(
            [UserRole.ADMIN],
            {
                code: 'TICKET_STATUS_UPDATED',
                data: {
                    ticketId: data.ticketId,
                    clientLogin: data.clientLogin,
                    fromStatus: data.fromStatus,
                    toStatus: data.toStatus,
                },
            },
        );
    }

    private async resolveUserFromToken(token?: string): Promise<{ userId: number; role: UserRole }> {
        if (!token) {
            throw new WsException('Unauthorized');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET || 'secret',
            });

            const userId = Number(payload?.sub);
            const role = payload?.role as UserRole | undefined;

            if (!Number.isFinite(userId) || !role) {
                throw new WsException('Unauthorized');
            }

            return { userId, role };
        } catch {
            throw new WsException('Unauthorized');
        }
    }

    emitNewTIcket(ticket: any) {
        this.server.emit('newTicket', ticket);
    }
    emitStatusTicket(ticket: any) {
        this.server.emit('ticketStatusUpdated', ticket);
    }

    @SubscribeMessage('joinTicket')
    async handleJoinTicket(
        @MessageBody() data: { ticketId: number; token?: string },
        @ConnectedSocket() client: Socket,
    ) {
        const user = await this.resolveUserFromToken(data.token);

        const ticket = await this.prisma.ticket.findUnique({
            where: { id: data.ticketId },
            select: {
                id: true,
                authorId: true,
                AssignedToId: true,
            },
        });

        if (!ticket) {
            throw new WsException('Ticket not found');
        }

        if (user.role === UserRole.CLIENT && ticket.authorId !== user.userId) {
            throw new WsException('Access denied');
        }

        if (
            user.role === UserRole.AGENT &&
            ticket.AssignedToId !== null &&
            ticket.AssignedToId !== user.userId
        ) {
            throw new WsException('Access denied');
        }

        const room = `ticket-${data.ticketId}`;
        client.join(room);
        if (
            (user.role === UserRole.AGENT || user.role === UserRole.ADMIN)
            && ticket.AssignedToId !== null
            && ticket.AssignedToId === user.userId
        ) {
            client.join('ticket-internal-' + data.ticketId);
        }
        console.log(`Client ${client.id} joined room ${room}`);
    }

    @SubscribeMessage('joinInternalNotes')
    async handleJoinInternalNotes(
        @MessageBody() data: { ticketId: number; token?: string },
        @ConnectedSocket() client: Socket,
    ) {
        const user = await this.resolveUserFromToken(data.token);

        if (user.role !== UserRole.AGENT && user.role !== UserRole.ADMIN) {
            throw new WsException('Access denied');
        }

        const ticket = await this.prisma.ticket.findUnique({
            where: { id: data.ticketId },
            select: { id: true, AssignedToId: true, status: true },
        });

        if (!ticket) {
            throw new WsException('Ticket not found');
        }

        const lockedForOtherAgents =
            user.role === UserRole.AGENT &&
            ticket.status === 'IN_PROGRESS' &&
            ticket.AssignedToId !== null &&
            ticket.AssignedToId !== user.userId;

        if (lockedForOtherAgents) {
            throw new WsException('Access denied');
        }

        client.join('ticket-internal-' + data.ticketId);
    }

    @SubscribeMessage('leaveInternalNotes')
    handleLeaveInternalNotes(
        @MessageBody() data: { ticketId: number },
        @ConnectedSocket() client: Socket,
    ) {
        client.leave('ticket-internal-' + data.ticketId);
    }

    emitInternalNoteCreated(ticketId: number, note: any) {
        this.server.to('ticket-internal-' + ticketId).emit('ticketInternalNoteCreated', note);
    }
    @SubscribeMessage('leaveTicket')
    handleLeaveTicket(
        @MessageBody() data: { ticketId: number },
        @ConnectedSocket() client: Socket,
    ) {
        const room = `ticket-${data.ticketId}`;
        client.leave(room);
        console.log(`Client ${client.id} left room ${room}`);
    }

    emitNewMessage(ticketId: number, message: any) {
        this.server.to(`ticket-${ticketId}`).emit('newMessage', message);
    }

    emitTicketClosed(ticketId: number) {
        this.server.to(`ticket-${ticketId}`).emit('ticketClosed', { ticketId });
    }

    emitTicketUnreadUpdated(ticketId: number, clientUnreadCount: number,
        agentUnreadCount: number) {
        this.server.emit('ticketUnreadUpdated', {
            ticketId,
            clientUnreadCount,
            agentUnreadCount
        });
    }
}