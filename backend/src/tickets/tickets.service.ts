import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TicketsService {
    constructor(private prisma: PrismaService){}

    async createTicket(title: string, description: string, authorId: number){
        return this.prisma.ticket.create({
            data: {
                title,
                description,
                authorId
            }
        })
    }

    async getAllTickets(){
        return this.prisma.ticket.findMany({
            include: {author : true}
        })
    }
}
