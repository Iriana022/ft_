import { Body, Controller, UseGuards, Post, Get, Patch, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateMeDto } from './dto/update-me.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  create(@Body() data: { fortyTwoId: number, login: string, email: string }) {
    return this.userService.create(data)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(
    @Req() req: any 
  ) {
    return this.userService.findMe(req.user.userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(
    @Req() req: any,
    @Body() dto: UpdateMeDto
  ){
    return this.userService.updateMe(req.user.userId, dto);
  }
}
