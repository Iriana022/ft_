import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { FortyTwoAuthGuard } from './fortytwo.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  
  constructor(private authService: AuthService){}

  @Get('42')
  @UseGuards(FortyTwoAuthGuard)
  login42() {
    // Cette fonction est vide car le Guard redirige automatiquement vers 42
  }

  @Get('42/callback')
  @UseGuards(FortyTwoAuthGuard)
  async callback42(@Req() req) {
    return this.authService.login(req.user);
  }
}
