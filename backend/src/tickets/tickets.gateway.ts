import {
    WebSocketGateway, WebSocketServer, OnGatewayConnection,
    OnGatewayDisconnect, SubscribeMessage, MessageBody, ConnectedSocket, WsException
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';


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
        console.log(`Client ${client.id} joined room ${room}`);
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