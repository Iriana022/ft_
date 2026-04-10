import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
//import { PrismaService } from './prisma.service';
import {ValidationPipe} from '@nestjs/common';
import {NestExpressApplication} from '@nestjs/platform-express';
import {join} from 'path';
import {mkdirSync} from 'fs';
import {seedAdmin} from 'prisma/seed';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	mkdirSync(join(process.cwd(), 'uploads'), {recursive: true});
	app.useGlobalPipes(new ValidationPipe({
		whitelist: true,
		forbidNonWhitelisted: true,
		transform: true,
	}));

	(app as NestExpressApplication).set('trust proxy', 1);

	app.enableCors({
		origin: true,
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		credentials: true,
	});

	app.useStaticAssets(join(process.cwd(), 'uploads'), {
		prefix: '/uploads/',
	});

	// create Admin
	try {
		await seedAdmin();
	} catch (e) {
		console.error("Seed failed:", e);
	}

	await app.listen(3000);
}
bootstrap();
