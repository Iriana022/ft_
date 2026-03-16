import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';

@Injectable()
export class TicketsService {
    constructor(private prisma: PrismaService){}

    async createTicket(dto: CreateTicketDto, authorId: number){
        return this.prisma.ticket.create({
            data: {
                title: dto.title,
                description: dto.description,
                priority: dto.priority,
                authorId
            },
            include: { author: true }
        })
    }

    async getAllTickets(){
        return this.prisma.ticket.findMany({
            include: {author : true, AssignedTo: true}
        })
    }

    async updateTicketStatus(ticketId: number, dto: UpdateTicketStatusDto){
        const ticket = await this.prisma.ticket.findUnique({
            where: { id: ticketId },
        })

        if (!ticket) {
            throw new NotFoundException('Ticket introuvable')
        }

        return this.prisma.ticket.update({
            where: { id: ticketId },
            data: {
                status: dto.status as never,
            },
            include: { author: true, AssignedTo: true }
        })
    }
}
