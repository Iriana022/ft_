import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { RolesGuard } from 'src/auth/roles.guard';

@Module({
  providers: [UserService, PrismaService, RolesGuard],
  controllers: [UserController]
})
export class UserModule {}
