import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GoogleController } from './google.controller';
import { GoogleService } from './google.service';
import { PrismaModule } from '../../../prisma/prisma.module';
import { TicketsModule } from '../../tickets/tickets.module';

@Module({
  imports: [PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    TicketsModule,
  ],
  controllers: [GoogleController],
  providers: [GoogleService]
})
export class GoogleModule {}
