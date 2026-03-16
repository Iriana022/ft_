import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';

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
            include: {author : true}
        })
    }
}
