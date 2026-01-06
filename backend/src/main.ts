import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
//import { PrismaService } from './prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // --- TEST PRISMA ---
 /*  const prismaService = app.get(PrismaService);
  
  console.log('🚀 Tentative de connexion à la DB...');
  
  try {
    const newUser = await prismaService.user.upsert({
      where: { email: 'test@42.fr' },
      update: {},
      create: {
        fortyTwoId: 12345,
        login: 'test-user',
        email: 'test@42.fr',
      },
    });
    console.log('✅ Succès ! Utilisateur créé ou trouvé :', newUser);
  } catch (error) {
    console.error('❌ Erreur Prisma :', error);
  } */
  // -------------------
  app.enableCors({
    origin: true, // Autorise toutes les sources pour le moment (plus simple pour l'équipe)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
