import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { ApiModule } from './api/api.module';
import { ApplicationModule } from './application/application.module';
import { AuthModule } from './auth/auth.module';
import { ResultExceptionFilter } from './filters/result-exception.filter';
import { PersistenceModule } from './persistence/persistence.module';

/**
 * Módulo principal de infraestructura
 */
@Module({
  imports: [
    // Configuración global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Módulos de la aplicación
    PersistenceModule,
    AuthModule,
    ApplicationModule,
    ApiModule,
  ],
  providers: [
    // Filtro global para manejar excepciones
    {
      provide: APP_FILTER,
      useClass: ResultExceptionFilter,
    },
  ],
})
export class InfrastructureModule {}
