import { Controller, Get, Query, Res, } from '@nestjs/common';
import { GoogleService } from './google.service';
import type { Response } from 'express'; 
import * as os from 'os';

function getDynamicFrontendUrl() {
  const networkInterfaces = os.networkInterfaces();
  let detectedIp = 'localhost'; // Par défaut si on ne trouve rien

  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    if (interfaces) {
      for (const iface of interfaces) {
        // On cherche une adresse IPv4 qui n'est pas interne (127.0.0.1)
        // À 42, l'IP commence généralement par 10.
        if (iface.family === 'IPv4' && !iface.internal && iface.address.startsWith('10.')) {
          detectedIp = iface.address;
          break;
        }
      }
    }
  }
  return `http://${detectedIp}:8443`;
}


type GoogleFlow = 'login' | 'register';

@Controller('auth/google')
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  @Get('login')
  googleLogin(@Res() res: Response, @Query('flow') flow?: GoogleFlow) {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const safeFlow: GoogleFlow = flow === 'register' ? 'register' : 'login';
    const options = {
      redirect_uri: process.env.GOOGLE_REDIRECT_URI as string,
      client_id: process.env.GOOGLE_CLIENT_ID as string,
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
    @Query('state') state: GoogleFlow,
    @Res() res: Response) {
    
    const frontendUrl = process.env.FRONTEND_URL || getDynamicFrontendUrl();
    //const frontendUrl = process.env.FRONTEND_URL || 'https://localhost:8443';
    const flow: GoogleFlow = state === 'register' ? 'register' : 'login';
    if (!code) {
      return res.redirect(`${frontendUrl}/login?error=no_code`);
    }

    try {
      const authData = await this.googleService.exchangeTicket(code, flow);
      if (authData.status === 'EMAIL_EXISTS') {
        return res.redirect(frontendUrl + '/auth/callback?error=email_exists_google');
      }
      if (authData.status === 'ROLE_SELECTION_REQUIRED') {
        return res.redirect(frontendUrl + '/auth/callback?token=' + encodeURIComponent(authData.access_token) + '&next=select_role');
      }      
      // --- LA MODIFICATION EST ICI ---
      // Au lieu de res.json(...), on redirige vers le front en passant le token dans l'URL
      return res.redirect(frontendUrl + '/auth/callback?token=' + encodeURIComponent(authData.access_token) + '&next=home');
      // return res.redirect(`${frontendUrl}/auth/callback?token=${authData.access_token}`);
      
    } catch (error) {
      console.error('Erreur Callback:', error);
      return res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }
  }
}