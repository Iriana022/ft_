import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GoogleService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async exchangeTicket(code: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    // Vérification de sécurité locale
    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error("Missing Google configuration in .env");
    }

    try {
      // 1. Échange du code contre les tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        // On force le passage en string pour garantir le format x-www-form-urlencoded
        body: new URLSearchParams({
          code: code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }).toString(),
      });

      const tokens = await tokenResponse.json();

      if (!tokenResponse.ok) {
        console.error('Détail Erreur Google Token:', tokens);
        throw new UnauthorizedException(`Google error: ${tokens.error_description || tokens.error}`);
      }

      // 2. Récupération du profil Google
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      
      const profile = await userResponse.json();

      if (!userResponse.ok) {
        console.error('Détail Erreur Google Profile:', profile);
        throw new UnauthorizedException('Impossible de récupérer le profil Google');
      }

      // 3. Persistance avec Prisma (Upsert)
      // Note: On ajoute un suffixe aléatoire au login pour éviter les collisions si 2 users ont le même prénom
      const user = await this.prisma.user.upsert({
        where: { googleId: profile.sub },
        update: {
          avatar: profile.picture,
        },
        create: {
          googleId: profile.sub,
          email: profile.email,
          login: `${profile.given_name.toLowerCase()}_${Math.floor(1000 + Math.random() * 9000)}`,
          avatar: profile.picture,
          role: 'CLIENT',
        },
      });

      // 4. Génération du JWT interne
      const payload = { sub: user.id, email: user.email };

      return {
        access_token: this.jwtService.sign(payload),
        user: user,
      };

    } catch (error) {
      // On log l'erreur réelle pour le debug Docker mais on renvoie une exception propre
      console.error('--- ERREUR AUTH GOOGLE ---');
      console.error(error);
      throw new UnauthorizedException(
        error instanceof UnauthorizedException ? error.message : 'Échec de la communication avec Google'
      );
    }
  }
}