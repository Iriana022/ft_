import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class GoogleService {
  constructor(private prisma: PrismaService, 
                private jwtService: JwtService
  ) {}

  async exchangeTicket(code: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID as string;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET as string;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI as string;

    try {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      const tokens = await tokenResponse.json();
      if (tokens.error) {
        throw new UnauthorizedException(`Google error: ${tokens.error_description}`);
      }

      // --- GET Google profile ---
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const profile = await userResponse.json();

      // UPSERT, if not exist, create else connect with profile
      const user = await this.prisma.user.upsert({
        where: { googleId: profile.sub }, // 'sub' est l'ID unique de Google
        update: {
          avatar: profile.picture,
        },
        create: {
          googleId: profile.sub,
          email: profile.email,
          login: profile.given_name, 
          avatar: profile.picture,
          role: 'CLIENT', 
        },
      });

      const payload = { sub: user.id, email: user.email };

      // return user from databae
      return {
            access_token: this.jwtService.sign(payload),
            user: user
        };

    } catch (error) {
      console.error('Erreur Auth Google:', error);
      throw new UnauthorizedException('Échec de la communication avec Google');
    }
  }
}