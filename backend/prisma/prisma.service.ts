import {Injectable, OnModuleInit, OnModuleDestroy} from '@nestjs/common';
import {PrismaClient} from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
	// Se connecte à la BDD au démarrage du module
	async onModuleInit() {
		await this.$connect();
	}

	// Ferme la connexion proprement à la fermeture de l'app
	async onModuleDestroy() {
		await this.$disconnect();
	}
}
