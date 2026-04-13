import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { TicketsGateway } from './tickets.gateway';
import { JwtModule } from '@nestjs/jwt';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
    }),
  ],
  controllers: [TicketsController],
  providers: [TicketsService, TicketsGateway, RolesGuard],
  exports: [TicketsGateway]
})
export class TicketsModule { }
