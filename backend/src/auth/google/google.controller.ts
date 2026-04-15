import { Controller, Get, Query, Res, InternalServerErrorException } from '@nestjs/common';
import { GoogleService } from './google.service';
import type { Response } from 'express';
import { setAuthCookie } from '../auth-cookie';

type GoogleFlow = 'login' | 'register';

@Controller('auth/google')
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  @Get('login')
  googleLogin(@Res() res: Response, @Query('flow') flow?: GoogleFlow) {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!redirectUri || !clientId) {
      throw new InternalServerErrorException('Configuration Google manquante dans le .env');
    }

    const safeFlow: GoogleFlow = flow === 'register' ? 'register' : 'login';
    
    const options = {
      redirect_uri: redirectUri,
      client_id: clientId,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      state: safeFlow,
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
    };

    const queryString = new URLSearchParams(options).toString();
    return res.redirect(`${rootUrl}?${queryString}`);
  }

  @Get('callback')
  async googleAuthRedirect(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response
  ) {
 
    const frontendUrl = process.env.FRONTEND_URL || 'https://localhost:8443';
    
    const flow: GoogleFlow = state === 'register' ? 'register' : 'login';

    if (!code) {
      return res.redirect(`${frontendUrl}/login?error=no_code`);
    }

    try {
      const authData = await this.googleService.exchangeTicket(code, flow);

      if (authData.status === 'EMAIL_EXISTS') {
        return res.redirect(`${frontendUrl}/auth/callback?error=email_exists_google`);
      }

      if (authData.status === 'ROLE_SELECTION_REQUIRED') {
        setAuthCookie(res, authData.access_token);
        return res.redirect(`${frontendUrl}/auth/callback?next=select_role`);
      }      

      setAuthCookie(res, authData.access_token);
      return res.redirect(`${frontendUrl}/auth/callback?next=home`);
      
    } catch (error) {
      console.error('Erreur Callback Google:', error);
      return res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }
  }
}