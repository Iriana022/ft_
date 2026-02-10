import { Controller, Get, UseGuards, Req, Body, Post } from '@nestjs/common';
import { FortyTwoAuthGuard } from './fortytwo.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto'

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

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req) {
    return req.user; // Retournera le payload décodé (id, username, role)
  }

  // auth.controller.ts

  @Post('login')
  async login(@Body() dto: any) {
    // Ici, on valide l'utilisateur (email/password)
    console.log('DTO reçu du front:', dto);
    const user = await this.authService.validateLocalUser(dto.email, dto.password);
    
    // Si c'est bon, on génère le token
    return this.authService.login(user);
  }

 
}
