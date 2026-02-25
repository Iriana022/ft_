import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GoogleController } from './google.controller';
import { GoogleService } from './google.service';
import { PrismaModule } from '../../../prisma/prisma.module'

@Module({
  imports: [PrismaModule,
    JwtModule.register({ // Ou l'import de ton AuthModule si le Jwt y est exporté
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [GoogleController],
  providers: [GoogleService]
})
export class GoogleModule {}
