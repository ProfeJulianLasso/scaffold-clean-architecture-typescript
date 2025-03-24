import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtTokenService } from '../services/jwt-token.service';

/**
 * Módulo de autenticación para configurar servicios relacionados
 */
@Module({
  imports: [
    // Configuración del módulo JWT
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'your-secret-key'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h'),
        },
      }),
    }),
  ],
  providers: [
    // Servicio de tokens
    {
      provide: 'ITokenService',
      useClass: JwtTokenService,
    },
  ],
  exports: [
    // Exportamos el servicio de tokens para su uso en otros módulos
    'ITokenService',
  ],
})
export class AuthModule {}
