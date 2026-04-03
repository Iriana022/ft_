import { Controller, Get } from '@nestjs/common';
import { Test2Service } from './test2.service';

@Controller('test2')
export class Test2Controller {
    constructor(private service: Test2Service){}
    @Get('hello')
    hello(){
        return this.service.sayhello()
    }
}
