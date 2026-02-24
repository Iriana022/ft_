import { Controller, Get, Query, Header, Res } from '@nestjs/common';
import { GoogleService } from './google.service';

@Controller('auth/google')
export class GoogleController {
    constructor(private readonly googleService: GoogleService){}
    @Get('callback')
    async googleAuthRedirect(@Query('code') code : string){
        if (!code) return "Pas de code reçu";
    
        // On essaye de récupérer le profil
        const profile = await this.googleService.exchangeTicket(code);
        
        // Au lieu de juste faire un console.log, on l'affiche dans le navigateur
        return {
            message: "Bravo ! Le backend a reçu le ticket.",
            data_from_google: profile
        };
    }

    @Get('login')
    @Header('Content-Type', 'application/json')
    googleLogin(@Res() res) {
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

}
