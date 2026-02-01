import { Controller, Body, Post, Get } from '@nestjs/common';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService){}

   /*  @Post()
    async create(
        @Body('title') title : string,
        @Body('description') description : string,
        @Body('authorId') authorId: Number
    ){
        return this.ticketsService.createTicket(title, description, authorId)
    } */

    @Get()
    async findAll(){
        return this.ticketsService.getAllTickets()
    }
}
