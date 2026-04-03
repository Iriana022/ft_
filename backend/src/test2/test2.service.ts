import { Injectable } from '@nestjs/common';

@Injectable()
export class Test2Service {
    sayhello(){
        return "hello world"
    }
}
