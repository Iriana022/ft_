import { Controller, Body, Post, Get, UseGuards, Req, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';

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
        @Req() req: { user: { userId: number } },
    ){
        return this.ticketsService.updateTicketStatus(id, dto, req.user.userId)
    }

    @Get(':id/messages')
    @UseGuards(JwtAuthGuard)
    async getMessages(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: { user: { userId: number } },
    ) {
        return this.ticketsService.getMessage(id);
    }

    @Post(':id/messages')
    @UseGuards(JwtAuthGuard)
    async createMessages(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CreateChatMessageDto,
        @Req() req: { user: { userId: number } },
    ) {
        return this.ticketsService.createMessage(id, dto, req.user.userId);
    }

    @Patch(':id/read')
    @UseGuards(JwtAuthGuard)
    async markAsRead(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: { user: {
            userId: number;
            role: 'CLIENT' | 'AGENT' | 'ADMIN'
        }},
    ) {
        return this.ticketsService.markTicketMessagesAsRead(
            id,
            req.user.userId,
            req.user.role as any,
        );
    }
}
