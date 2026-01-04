import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
const Strategy = require('passport-42');
import { AuthService } from './auth.service';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor(private authService: AuthService) {
    super({
        clientID: process.env.FORTYTWO_CLIENT_ID,
        clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/auth/42/callback',
        profileFields: {
            'id': function (obj) { return String(obj.id); },
            'username': 'login',
            'emails.0.value': 'email',
            'photos.0.value': 'image.link'
        }
    } as any);
  }

  async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
    // C'est ici que tu reçois les infos de 42 (login, email, image)
    // On va les envoyer à notre service pour les enregistrer ou les vérifier
    const user = {
      fortyTwoId: profile.id,
      email: profile.emails[0].value,
      login: profile.username,
      avatar: profile.photos[0].value,
    };
    return user;
  }
}