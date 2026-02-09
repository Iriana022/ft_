import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}
  
  async login(user: any) {
    const payload = { 
      username: user.login || user.email, 
      sub: user.id, 
      role: user.role || 'CLIENT' 
    };
    return {
      access_token: this.jwt.sign(payload),
    };
  }


  
    async register(dto: any) {
      // 1. if user eists
        const userExists = await this.prisma.user.findUnique({
        where: { email: dto.email }
      });
      if (userExists) throw new ConflictException('Email déjà utilisé');

      // 2. Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(dto.password, salt);

      // 3. Base create
      return this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          login: dto.login,
          role: 'CLIENT', 
        },
      });
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
          role: 'CLIENT', // Role here
        },
      });
    }
    return user;
  }
}