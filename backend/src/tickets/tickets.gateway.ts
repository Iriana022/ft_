import { WebSocketGateway, WebSocketServer, OnGatewayConnection,
    OnGatewayDisconnect } from '@nestjs/websockets';
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
}