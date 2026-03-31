import { Controller, Get, Query, Res, InternalServerErrorException } from '@nestjs/common';
import { GoogleService } from './google.service';
import type { Response } from 'express'; // N'oublie pas le 'type' pour éviter l'erreur TS1272

@Controller('auth/google')
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  @Get('login')
  googleLogin(@Res() res: Response) {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirect_uri: process.env.GOOGLE_REDIRECT_URI as string,
      client_id: process.env.GOOGLE_CLIENT_ID as string,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
    };

    const queryString = new URLSearchParams(options).toString();
    return res.redirect(`${rootUrl}?${queryString}`);
  }

  @Get('callback')
  async googleAuthRedirect(@Query('code') code: string, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'https://localhost:8443';
    
    if (!code) {
      return res.redirect(`${frontendUrl}/login?error=no_code`);
    }

    try {
      const authData = await this.googleService.exchangeTicket(code);

      // --- LA MODIFICATION EST ICI ---
      // Au lieu de res.json(...), on redirige vers le front en passant le token dans l'URL
      return res.redirect(`${frontendUrl}/auth/callback?token=${authData.access_token}`);
      
    } catch (error) {
      console.error('Erreur Callback:', error);
      return res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }
  }
}