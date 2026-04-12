import { Controller, Body, Post, Get, UseGuards, Req, Patch, Param, ParseIntPipe, Query } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { CreateInternalNoteDto } from './dto/create-internal-note.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('tickets')
@ApiBearerAuth('bearer')
@Controller('tickets')
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Créer un ticket' })
    @ApiResponse({ status: 201, description: 'Ticket créé' })
    @ApiResponse({ status: 401, description: 'Non authentifié' })
    async create(
        @Body() dto: CreateTicketDto,
        @Req() req: { user: { userId: number } },
    ) {
        return this.ticketsService.createTicket(dto, req.user.userId)
    }

    @Get()
    @ApiOperation({ summary: 'Lister tous les tickets' })
    @ApiResponse({ status: 200, description: 'Liste récupérée' })
    async findAll() {
        return this.ticketsService.getAllTickets()
    }

    @Get('my')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Lister mes tickets' })
    @ApiResponse({ status: 200, description: 'Liste récupérée' })
    @ApiResponse({ status: 401, description: 'Non authentifié' })
    async findMine(
        @Req() req: { user: { userId: number } },
    ) {
        return this.ticketsService.getMyTickets(req.user.userId)
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Mettre à jour le statut d un ticket' })
    @ApiResponse({ status: 200, description: 'Statut mis à jour' })
    @ApiResponse({ status: 401, description: 'Non authentifié' })
    @ApiResponse({ status: 404, description: 'Ticket introuvable' })
    async updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateTicketStatusDto,
        @Req() req: { user: { userId: number } },
    ) {
        return this.ticketsService.updateTicketStatus(id, dto, req.user.userId)
    }

    @Get(':id/messages')
    @UseGuards(JwtAuthGuard)
    async getMessages(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: { user: { userId: number; role: 'CLIENT' | 'AGENT' | 'ADMIN' } },
    ) {
        return this.ticketsService.getMessage(id, req.user.userId, req.user.role as any);
    }

    @Post(':id/messages')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Envoyer un message dans un ticket' })
    @ApiResponse({ status: 201, description: 'Message envoyé' })
    @ApiResponse({ status: 401, description: 'Non authentifié' })
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
        @Req() req: {
            user: {
                userId: number;
                role: 'CLIENT' | 'AGENT' | 'ADMIN'
            }
        },
    ) {
        return this.ticketsService.markTicketMessagesAsRead(
            id,
            req.user.userId,
            req.user.role as any,
        );
    }

    @Get(':id/internal-notes')
    @UseGuards(JwtAuthGuard)
    async getInternalNotes(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: { user: { userId: number; role: 'CLIENT' | 'AGENT' | 'ADMIN' } },
    ) {
        return this.ticketsService.getInternalNotes(id, req.user.userId, req.user.role as any);
    }

    @Post(':id/internal-notes')
    @UseGuards(JwtAuthGuard)
    async createInternalNote(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CreateInternalNoteDto,
        @Req() req: { user: { userId: number; role: 'CLIENT' | 'AGENT' | 'ADMIN' } },
    ) {
        return this.ticketsService.createInternalNote(
            id,
            dto,
            req.user.userId,
            req.user.role as any,
        );
    }

    @Get('stats/resolution-history')
    @UseGuards(JwtAuthGuard)
    async getResolutionHistory(
        @Query('days') days: string | undefined,
        @Req() req: { user: { role: 'CLIENT' | 'AGENT' | 'ADMIN' } },
    ) {
        const parsedDays = days ? Number(days) : 7;
        return this.ticketsService.getTicketResolutionHistory(parsedDays, req.user.role as any);
    }

}
