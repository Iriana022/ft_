import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}
  
  async login(user: any) {
    const payload = { 
      username: user.login, 
      sub: user.id, 
      role: user.role 
    };
    return {
      access_token: this.jwt.sign(payload),
    };
  }


  
  async register(dto: any) {
    const userExists = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });
    if (userExists) throw new ConflictException('Email déjà utilisé');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        login: dto.login,
        role: 'CLIENT', // Rôle par défaut de ton enum
      },
    });
  }

  async validateUser(profile: any) {
    let user = await this.prisma.user.findUnique({
      where: { fortyTwoId: Number(profile.fortyTwoId) },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          fortyTwoId: Number(profile.fortyTwoId),
          login: profile.login,
          email: profile.email,
          avatar: profile.avatar,
          role: 'CLIENT', // On assure le rôle ici aussi
        },
      });
    }
    return user;
  }
}