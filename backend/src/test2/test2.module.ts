import { Module } from '@nestjs/common';
import { Test2Controller } from './test2.controller';
import { Test2Service } from './test2.service';

@Module({
  controllers: [Test2Controller],
  providers: [Test2Service]
})
export class Test2Module {}
