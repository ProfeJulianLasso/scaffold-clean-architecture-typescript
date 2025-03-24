import { Module } from '@nestjs/common';
import { ApplicationModule } from '../application/application.module';
import { AuthController } from '../controllers/auth.controller';

/**
 * Módulo para configurar los controladores de la API
 */
@Module({
  imports: [
    // Importamos el módulo de aplicación
    ApplicationModule,
  ],
  controllers: [
    // Controladores de la API
    AuthController,
  ],
})
export class ApiModule {}
