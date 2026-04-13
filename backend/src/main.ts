import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { seedAdmin } from 'prisma/seed';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	mkdirSync(join(process.cwd(), 'uploads'), { recursive: true });
	app.useGlobalPipes(new ValidationPipe({
		whitelist: true,
		forbidNonWhitelisted: true,
		transform: true,
	}));

	const swaggerConfig = new DocumentBuilder()
		.setTitle('Tikeo Public API')
		.setDescription('Documentation de l API publique Tikeo')
		.setVersion('1.0')
		.addBearerAuth(
			{ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
			'bearer',
		)
		.build();

	const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

	SwaggerModule.setup('docs', app, swaggerDocument, {
		swaggerOptions: {
			persistAuthorization: true,
		},
	});

	app.enableCors({
		origin: true,
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		credentials: true,
	});

	app.useStaticAssets(join(process.cwd(), 'uploads'), {
		prefix: '/uploads/',
	});

	try {
		await seedAdmin();
	} catch (e) {
		console.error("Seed failed:", e);
	}

	await app.listen(3000);
}
bootstrap();
