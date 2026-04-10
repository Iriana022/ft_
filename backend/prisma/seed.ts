import {PrismaClient, UserRole} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedAdmin() {
	const existingAdmin = await prisma.user.findFirst({
		where: {role: UserRole.ADMIN},
	});

	if (existingAdmin) {
		console.log('Admin already exists');
		return;
	}

	const hashedPassword = await bcrypt.hash('dontoman', 10);

	await prisma.user.create({
		data: {
			email: 'tikeoadmin@gmail.com',
			login: 'admin',
			password: hashedPassword,
			role: UserRole.ADMIN,
		},
	});

	console.log('Admin created');
}
