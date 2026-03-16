import { Controller, Body, Post, Get, UseGuards, Req } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Controller('tickets')
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService){}

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(
        @Body() dto: CreateTicketDto,
        @Req() req: { user: { userId: number } },
    ){
        return this.ticketsService.createTicket(dto, req.user.userId)
    }

    @Get()
    async findAll(){
        return this.ticketsService.getAllTickets()
    }
}
