import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}
  
  async login(user: any){
    const payload = { username:user.login, sub: user.id}
    return {
      access_token: this.jwt.sign(payload)
    }
  }

  async validateUser(profile: any) {
    // On cherche l'utilisateur par son ID 42
    let user = await this.prisma.user.findUnique({
      where: { fortyTwoId: Number(profile.fortyTwoId) },
    });


    // S'il n'existe pas, on le crée !
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          fortyTwoId: Number(profile.fortyTwoId),
          login: profile.login,
          email: profile.email,
          avatar: profile.avatar,
        },
      });
      console.log('Nouvel utilisateur créé:', user.login);
    } else {
      console.log('Utilisateur existant connecté:', user.login);
    }

    return user;
  }
}