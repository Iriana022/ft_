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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Rend les variables accessibles partout
      envFilePath: '.env', // Précise bien le chemin
    }), AuthModule, UserModule, TicketsModule, PrismaModule, GoogleModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService]
})
export class AppModule {}
