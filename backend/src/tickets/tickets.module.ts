import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TicketsGateway } from './tickets.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
    }),
  ],
  controllers: [TicketsController],
  providers: [TicketsService, PrismaService, TicketsGateway],
  exports: [TicketsGateway]
})
export class TicketsModule { }
