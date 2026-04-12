import { Delete, HttpCode, HttpStatus, BadRequestException, UseInterceptors, UploadedFile, Body, Controller, UseGuards, Post, Get, Put, Patch, Req, Param, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateMeDto } from './dto/update-me.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('user')
@ApiBearerAuth('bearer')
@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) { }

	@Post()
	create(@Body() data: { login: string, email: string }) {
		return this.userService.create(data)
	}

	@Get()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	@ApiOperation({ summary: 'Lister les utilisateurs (admin)' })
	@ApiResponse({ status: 200, description: 'Liste récupérée' })
	@ApiResponse({ status: 403, description: 'Accès refusé' })
	findAll() {
		return this.userService.findAll();
	}

	@Get('me')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Récupérer mon profil' })
	@ApiResponse({ status: 200, description: 'Profil récupéré' })
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
	) {
		return this.userService.updateMe(req.user.userId, dto);
	}

	@Patch('me/avatar')
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(
		FileInterceptor('avatar', {
			storage: diskStorage({
				destination: join(process.cwd(), 'uploads'),
				filename: (_req, file, cb) => {
					const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
					cb(null, 'avatar-' + unique + extname(file.originalname));
				},
			}),
			limits: { fileSize: 2 * 1024 * 1024 },
			fileFilter: (_req, file, cb) => {
				const ok = /image\/(jpeg|jpg|png|webp)/.test(file.mimetype);
				cb(ok ? null : new BadRequestException('Format image invalide'), ok);
			},
		}),
	)
	async updateAvatar(
		@Req() req: any,
		@UploadedFile() file: any,
	) {
		if (!file) {
			throw new BadRequestException('Missing file');
		}
		const avatar = '/api/uploads/' + file.filename;
		try {
			return await this.userService.updateAvatar(req.user.userId, avatar);
		} catch (error) {
			const uploadedPath = join(process.cwd(), 'uploads', file.filename);
			await unlink(uploadedPath).catch(() => undefined);
			throw error;
		}
	}

	@Delete('me')
	@UseGuards(JwtAuthGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	async deleteMe(@Req() req: any) {
		await this.userService.deleteMe(req.user.userId);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Supprimer un utilisateur (admin)' })
	@ApiResponse({ status: 204, description: 'Utilisateur supprimé' })
	@ApiResponse({ status: 403, description: 'Accès refusé' })
	async deleteUserByAdmin(
		@Param('id', ParseIntPipe) id: number,
		@Req() req: { user: { userId: number; role: 'CLIENT' | 'AGENT' | 'ADMIN' } },
	) {
		await this.userService.deleteUserByAdmin(
			req.user.userId,
			id,
			req.user.role as any,
		);
	}

	@Get('notifications')
	@UseGuards(JwtAuthGuard)
	getMyNotifications(@Req() req: { user: { userId: number } }) {
		return this.userService.getMyNotifications(req.user.userId);
	}

	@Put('notifications/read-all')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Marquer toutes mes notifications comme lues' })
	@ApiResponse({ status: 200, description: 'Notifications mises à jour' })
	readAllMyNotifications(@Req() req: { user: { userId: number } }) {
		return this.userService.readAllMyNotifications(req.user.userId);
	}
}
