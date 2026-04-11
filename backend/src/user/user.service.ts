import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { basename, join } from 'path';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateMeDto } from './dto/update-me.dto';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }
    private readonly deletedUserEmail = 'deleted-user@system.local';
    private readonly uploadsPrefix = '/api/uploads/';
    private isManagedUploadAvatar(avatar: string | null | undefined) {
        return !!avatar && avatar.startsWith(this.uploadsPrefix);
    }

    private toUploadDiskPath(avatarUrl: string) {
        return join(process.cwd(), 'uploads', basename(avatarUrl));
    }

    async create(data: { login: string, email: string }) {
        return this.prisma.user.create({ data })
    }

    async findAll() {
        return this.prisma.user.findMany({
            where: {
                email: {
                    not: this.deletedUserEmail,
                },
            },
            include: {
                ticketsCreated: true, // Demande à Prisma de joindre les tickets liés
            },
        });
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
            where: { id: userId },
            select: { avatar: true },
        });

        if (!currentUser) {
            throw new NotFoundException('User not found');
        }

        const oldAvatar = currentUser.avatar;

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { avatar },
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

        if (oldAvatar && oldAvatar !== avatar && this.isManagedUploadAvatar(oldAvatar)) {
            const oldPath = this.toUploadDiskPath(oldAvatar);
            await unlink(oldPath).catch(() => undefined);
        }
        return updatedUser;
    }

    async deleteMe(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { avatar: true },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const avatarToDelete = user.avatar;
        await this.prisma.$transaction(async (tx) => {
            await tx.ticket.updateMany({
                where: { AssignedToId: userId },
                data: { AssignedToId: null },
            });


            await tx.chatMessage.deleteMany({
                where: {
                    OR: [
                        { authorId: userId },
                        { ticket: { authorId: userId } },
                    ],
                },
            });

            await tx.ticket.deleteMany({
                where: { authorId: userId },
            });

            await tx.user.delete({
                where: { id: userId },
            });
        });
        if (avatarToDelete && this.isManagedUploadAvatar(avatarToDelete)) {
            const avatarPath = this.toUploadDiskPath(avatarToDelete);
            await unlink(avatarPath).catch(() => undefined);
        }
    }

    async deleteUserByAdmin(adminId: number, targetUserId: number, adminRole: UserRole) {
        if (adminRole !== UserRole.ADMIN) {
            throw new ForbiddenException('Seul un admin peut supprimer un utilisateur');
        }

        if (targetUserId === adminId) {
            throw new ForbiddenException('Vous ne pouvez pas supprimer votre propre compte ici');
        }

        const targetUser = await this.prisma.user.findUnique({
            where: { id: targetUserId },
            select: { id: true, avatar: true, email: true },
        });

        if (!targetUser) {
            throw new NotFoundException('User not found');
        }

        if (targetUser.email === this.deletedUserEmail) {
            throw new ForbiddenException('Ce compte système ne peut pas être supprimé');
        }

        const avatarToDelete = targetUser.avatar;

        await this.prisma.$transaction(async (tx) => {
            const deletedUser = await tx.user.upsert({
                where: { email: this.deletedUserEmail },
                update: {},
                create: {
                    email: this.deletedUserEmail,
                    firstName: 'Utilisateur',
                    lastName: 'supprime',
                    role: UserRole.CLIENT,
                },
                select: { id: true },
            });

            if (deletedUser.id === targetUserId) {
                throw new ForbiddenException('Ce compte système ne peut pas être supprimé');
            }

            await tx.ticket.updateMany({
                where: { authorId: targetUserId },
                data: { authorId: deletedUser.id },
            });

            await tx.ticket.updateMany({
                where: { AssignedToId: targetUserId },
                data: { AssignedToId: null },
            });

            await tx.chatMessage.updateMany({
                where: { authorId: targetUserId },
                data: { authorId: deletedUser.id },
            });

            await tx.ticketInternalNote.updateMany({
                where: { authorId: targetUserId },
                data: { authorId: deletedUser.id },
            });

            await tx.ticketStatusHistory.updateMany({
                where: { changedById: targetUserId },
                data: { changedById: deletedUser.id },
            });

            await tx.user.delete({
                where: { id: targetUserId },
            });
        });

        if (avatarToDelete && this.isManagedUploadAvatar(avatarToDelete)) {
            const avatarPath = this.toUploadDiskPath(avatarToDelete);
            await unlink(avatarPath).catch(() => undefined);
        }
    }
}