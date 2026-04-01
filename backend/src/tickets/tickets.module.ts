import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TicketsGateway } from './tickets.gateway';

@Module({
  controllers: [TicketsController],
  providers: [TicketsService, PrismaService, TicketsGateway]
})
export class TicketsModule {}
