import { Controller, Get, UseGuards, Req, Body, Post } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto'

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) { }

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
    const user = await this.authService.validateLocalUser(dto.email, dto.password);

    // Si c'est bon, on génère le token
    return this.authService.login(user);
  }

  @Post('select-role')
  @UseGuards(JwtAuthGuard)
  async selectRole(
    @Req() req,
    @Body() dto: { role: 'CLIENT' | 'AGENT' }) {
    return this.authService.completeGoogleRoleSelection(req.user.userId, dto.role);
  }
}
