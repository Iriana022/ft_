import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { basename, join } from 'path';
import { UserRole } from '@prisma/client';
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

    private async hardDeleteUserAndLinkedTickets(userId: number) {
        await this.prisma.$transaction(async (tx) => {
            // Tickets liés à l'utilisateur (client auteur OU agent assigné)
            const linkedTickets = await tx.ticket.findMany({
                where: {
                    OR: [
                        { authorId: userId },
                        { AssignedToId: userId },
                    ],
                },
                select: { id: true },
            });

            const linkedTicketIds = linkedTickets.map((t) => t.id);

            if (linkedTicketIds.length > 0) {
                await tx.ticketStatusHistory.deleteMany({
                    where: { ticketId: { in: linkedTicketIds } },
                });

                await tx.ticketInternalNote.deleteMany({
                    where: { ticketId: { in: linkedTicketIds } },
                });

                await tx.chatMessage.deleteMany({
                    where: { ticketId: { in: linkedTicketIds } },
                });

                await tx.ticket.deleteMany({
                    where: { id: { in: linkedTicketIds } },
                });
            }

            await tx.ticketStatusHistory.deleteMany({
                where: { changedById: userId },
            });

            await tx.ticketInternalNote.deleteMany({
                where: { authorId: userId },
            });

            await tx.chatMessage.deleteMany({
                where: { authorId: userId },
            });

            await tx.user.delete({
                where: { id: userId },
            });
        });
    }

    async create(data: { login: string, email: string }) {
        return this.prisma.user.create({ data })
    }

    async findAll() {
        return this.prisma.user.findMany({
            include: {
                ticketsCreated: true,
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

        await this.hardDeleteUserAndLinkedTickets(userId);

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
            select: { id: true, avatar: true, email: true, role: true },
        });

        if (!targetUser) {
            throw new NotFoundException('User not found');
        }

        if (targetUser.role === UserRole.ADMIN) {
            throw new ForbiddenException('Un admin ne peut pas supprimer un autre admin');
        }

        const avatarToDelete = targetUser.avatar;

        await this.hardDeleteUserAndLinkedTickets(targetUserId);

        if (avatarToDelete && this.isManagedUploadAvatar(avatarToDelete)) {
            const avatarPath = this.toUploadDiskPath(avatarToDelete);
            await unlink(avatarPath).catch(() => undefined);
        }
    }
}