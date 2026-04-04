import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { basename, join } from 'path';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateMeDto } from './dto/update-me.dto';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }
    private readonly uploadsPrefix = '/api/uploads/';
    private isManagedUploadAvatar(avatar: string | null | undefined) {
        return !!avatar && avatar.startsWith(this.uploadsPrefix);
    }

    private toUploadDiskPath(avatarUrl: string) {
        return join(process.cwd(), 'uploads', basename(avatarUrl));
    }

    async create(data: { fortyTwoId: number, login: string, email: string }) {
        return this.prisma.user.create({ data })
    }

    async findMe(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                login: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
                role: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new NotFoundException('Utilisateur introuvable');
        }
        return user;
    }

    async updateMe(userId: number, dto: UpdateMeDto) {
        try {
            const updated = await this.prisma.user.update({
                where: { id: userId },
                data: {
                    ...(dto.login !== undefined ? { login: dto.login || null } : {}),
                    ...(dto.email !== undefined ? { email: dto.email } : {}),
                    ...(dto.firstName !== undefined ? { firstName: dto.firstName || null } : {}),
                    ...(dto.lastName !== undefined ? { lastName: dto.lastName || null } : {}),
                },
                select: {
                    id: true,
                    login: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    role: true,
                    createdAt: true,
                },
            });
            return updated;
        } catch (error: any) {
            if (error?.code === 'P2002') {
                throw new ConflictException();
            }
            throw error;
        }
    }
    async updateAvatar(userId: number, avatar: string) {
        const currentUser = await this.prisma.user.findUnique({
            where: {id: userId},
            select: {avatar: true},
        });

        if (!currentUser) {
            throw new NotFoundException('User not found');
        }

        const oldAvatar = currentUser.avatar;

        const updatedUser = await this.prisma.user.update ({
            where: {id: userId},
            data: {avatar},
            select: {
                id: true,
                login: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
                role: true,
                createdAt: true,
            },
        });

        if(oldAvatar && oldAvatar !== avatar && this.isManagedUploadAvatar(oldAvatar)) {
            const oldPath = this.toUploadDiskPath(oldAvatar);
            await unlink(oldPath).catch(() => undefined);
        }
        return updatedUser;
    }
}