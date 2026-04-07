import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

type GoogleFlow = 'login' | 'register';

type GooglAuthResult =
  | { status: 'EMAIL_EXISTS' }
  | { status: 'ROLE_SELECTION_REQUIRED'; access_token: string }
  | { status: 'LOGIN_OK'; access_token: string }

@Injectable()
export class GoogleService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) { }
  private buildToken(user: { id: number; login: string | null; email: string; role: string }) {
    const payload = {
      sub: user.id,
      username: user.login || user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload)
  }
  async exchangeTicket(code: string, flow: GoogleFlow): Promise<GooglAuthResult> {
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

      const googleId = profile.sub as string;
      const email = profile.email as string;
      const avatar = profile.picture as string | undefined;
      const givenName = (profile.given_name as string | undefined)

      const userByGoogleId = await this.prisma.user.findUnique({
        where: { googleId },
      });
      const userByEmail = await this.prisma.user.findUnique({
        where: { email },
      });

      if (flow === 'register') {
        if (userByEmail) {
          return { status: 'EMAIL_EXISTS' };
        }
        const safeName = (givenName || 'user').toLowerCase();
        const created = await this.prisma.user.create({
          data: {
            googleId,
            email,
            login: safeName + '_' + Math.floor(1000 + Math.random() * 9000),
            avatar,
            role: 'CLIENT',
            roleSelectionRequired: true,
          },
        });

        return {
          status: 'ROLE_SELECTION_REQUIRED',
          access_token: this.buildToken(created),
        };
      }

      let user = userByGoogleId;
      if (user) {
        if (avatar && avatar !== user.avatar) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: { avatar },
          });
        }
      }
      else if (userByEmail) {
        user = await this.prisma.user.update({
          where: { id: userByEmail.id },
          data: { googleId, avatar: avatar ?? userByEmail.avatar },
        });
      }
      const safeName = (givenName || 'user').toLowerCase();
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            googleId,
            email,
            login: safeName + '_' + Math.floor(1000 + Math.random() * 9000),
            avatar,
            role: 'CLIENT',
            roleSelectionRequired: true,
          },
        });
      }

      const token = this.buildToken(user);

      if (user.roleSelectionRequired) {
        return { status: 'ROLE_SELECTION_REQUIRED', access_token: token };
      }
      return { status: 'LOGIN_OK', access_token: token };

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