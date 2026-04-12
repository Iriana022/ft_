import { Controller, Get, UseGuards, Req, Body, Post } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@ApiTags('auth')
@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) { }



  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Créer un compte utilisateur' })
  @ApiResponse({ status: 201, description: 'Compte créé' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Récupérer le profil courant' })
  @ApiResponse({ status: 200, description: 'Profil récupéré' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  getProfile(@Req() req) {
    return req.user;
  }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiResponse({ status: 200, description: 'Connexion réussie (JWT renvoyé)' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  async login(@Body() dto: any) {
    const user = await this.authService.validateLocalUser(dto.email, dto.password);
    return this.authService.login(user);
  }

  @Post('select-role')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Sélectionner le rôle après login Google' })
  @ApiResponse({ status: 200, description: 'Rôle assigné' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async selectRole(
    @Req() req,
    @Body() dto: { role: 'CLIENT' | 'AGENT' },
  ) {
    return this.authService.completeGoogleRoleSelection(req.user.userId, dto.role);
  }
}
