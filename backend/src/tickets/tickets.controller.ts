import { Controller, Body, Post, Get, UseGuards, Req, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';

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

    @Get('my')
    @UseGuards(JwtAuthGuard)
    async findMine(
        @Req() req: { user: { userId: number } },
    ){
        return this.ticketsService.getMyTickets(req.user.userId)
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard)
    async updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateTicketStatusDto,
    ){
        return this.ticketsService.updateTicketStatus(id, dto)
    }
}
