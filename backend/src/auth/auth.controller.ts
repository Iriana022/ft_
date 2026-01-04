import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { FortyTwoAuthGuard } from './fortytwo.guard';

@Controller('auth')
export class AuthController {
  
  @Get('42')
  @UseGuards(FortyTwoAuthGuard)
  login42() {
    // Cette fonction est vide car le Guard redirige automatiquement vers 42
  }

  @Get('42/callback')
  @UseGuards(FortyTwoAuthGuard)
  callback42(@Req() req) {
    // Ici, l'utilisateur revient de 42. 
    // Ses infos sont dans req.user grâce à la stratégie !
    return req.user;
  }
}
