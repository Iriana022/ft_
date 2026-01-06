import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService){}
    
    @Post()
    create(@Body() data: {fortyTwoId: number, login: string, email: string}){
        return this.userService.create(data)
    }

    @Get(':id')
    findOne(@Param('id') id: string){
        return this.userService.findOne(+id)
    }
}
