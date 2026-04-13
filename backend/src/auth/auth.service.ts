import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { TicketsGateway } from '../tickets/tickets.gateway';


@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService,
    private jwt: JwtService,
    private ticketsGateway: TicketsGateway,
  ) { }

  async login(user: any) {
    const payload = {
      username: user.login || user.email,
      sub: user.id,
      role: user.role || 'CLIENT'
    };
    const role = user.role as UserRole | undefined;
    if (role === UserRole.CLIENT || role === UserRole.AGENT) {
      void this.ticketsGateway.emitAdminNotificationUserLoggedIn({
        userLogin: user.login || user.email,
        userRole: role,
      });
    }
    return {
      access_token: this.jwt.sign(payload),
    };
  }

  async register(dto: any) {
    const userByEmail = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });
    if (userByEmail) throw new ConflictException('Email déjà utilisé');

    const userByLogin = await this.prisma.user.findUnique({
      where: { login: dto.login }
    });
    if (userByLogin) throw new ConflictException('Login déjà utilisé');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);
    const selectedRole = dto.role === 'AGENT' ? 'AGENT' : 'CLIENT';

    try {
      const createdUser = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          login: dto.login,
          role: selectedRole,
        },
      });

      this.ticketsGateway.emitAdminUsersChanged({
        userId: createdUser.id,
        action: 'created',
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        const target = Array.isArray(error?.meta?.target) ? error.meta.target : [];
        if (target.includes('email')) {
          throw new ConflictException('Email déjà utilisé');
        }
        if (target.includes('login')) {
          throw new ConflictException('Login déjà utilisé');
        }
        throw new ConflictException('Données déjà utilisées');
      }
      throw error;
    }
  }


  async validateLocalUser(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isMatch = await bcrypt.compare(pass, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    return user;
  }

  async completeGoogleRoleSelection(userId: number, role: 'CLIENT' | 'AGENT') {
    if (role !== 'CLIENT' && role !== 'AGENT') {
      throw new BadRequestException('Role invalide');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        role,
        roleSelectionRequired: false,
      },
    });

    return this.login(updated);
  }
}