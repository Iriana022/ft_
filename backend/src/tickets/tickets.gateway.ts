import { WebSocketGateway, WebSocketServer, OnGatewayConnection,
    OnGatewayDisconnect, SubscribeMessage, MessageBody, ConnectedSocket, } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    path: '/socket.io'
})

export class TicketsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        console.log(`Client connected : ${client.id}`);
    }
    handleDisconnect(client: Socket) {
        console.log(`Client disconnected : ${client.id}`);
    }
    emitNewTIcket(ticket: any) {
        this.server.emit('newTicket', ticket);
    }
    emitStatusTicket(ticket: any) {
        this.server.emit('ticketStatusUpdated', ticket);
    }

    @SubscribeMessage('joinTicket')
    handleJoinTicket(
        @MessageBody() data: { ticketId: number },
        @ConnectedSocket() client: Socket,
    ) {
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
}