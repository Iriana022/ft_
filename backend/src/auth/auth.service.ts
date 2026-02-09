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


  
  /* async register(dto: any) {
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
  } */

    async register(dto: any) {
      // 1. Vérifier si l'user existe déjà
      const userExists = await this.prisma.user.findUnique({
        where: { email: dto.email }
      });
      if (userExists) throw new ConflictException('Email déjà utilisé');

      // 2. Hasher le mot de passe proprement
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(dto.password, salt);

      // 3. Création en base
      return this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          login: dto.login,
          role: 'CLIENT', 
        },
      });
    }

  // auth.service.ts

  /* async validateLocalUser(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user || !user.password) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    return user;
  } */

    async validateLocalUser(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    // 1. On vérifie l'existence de l'user ET du password
    if (!user || !user.password) {
        throw new UnauthorizedException('Identifiants invalides');
    }

    // 2. Maintenant TypeScript sait que user.password est forcément une string
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
          role: 'CLIENT', // On assure le rôle ici aussi
        },
      });
    }
    return user;
  }
}