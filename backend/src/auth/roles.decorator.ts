import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client'; // Utilise l'enum de ton schéma

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);