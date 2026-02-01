import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService){}

    async create(data :{fortyTwoId: number, login: string, email: string}){
        return this.prisma.user.create({data})
    }

    /* async findOne(id: number){
        return this.prisma.user.findUnique({
            where :{id},
            include : {tickets: true}
        })
    } */
}