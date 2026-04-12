import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { TicketsModule } from './tickets/tickets.module';
import { PrismaModule } from '../prisma/prisma.module'
import { GoogleModule } from './auth/google/google.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Rend les variables accessibles partout
      envFilePath: '.env', // Précise bien le chemin
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,   // fenêtre de 60s
        limit: 120,    // 120 requêtes max / IP / 60s
      },
     ]), AuthModule, UserModule, TicketsModule, PrismaModule, GoogleModule],
      controllers: [AppController],
      providers: [AppService, PrismaService,
        {
          provide: APP_GUARD,
          useClass: ThrottlerGuard,
        },
      ],
      exports: [PrismaService],
})
export class AppModule { }
