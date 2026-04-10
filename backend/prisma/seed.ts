import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedAdmin() {
	const existingAdmin = await prisma.user.findFirst({
		where: { role: UserRole.ADMIN },
	});

	if (existingAdmin) {
		console.log('Admin already exists');
		return;
	}

	const email = process.env.ADMIN_EMAIL;
	const login = process.env.ADMIN_LOGIN;
	const password = process.env.ADMIN_PASSWORD;

	if (!email || !login || !password) {
		throw new Error('Missing ADMIN env variables');
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	await prisma.user.create({
		data: {
			email,
			login,
			password: hashedPassword,
			role: UserRole.ADMIN,
		},
	});

	console.log('Admin created');
}
