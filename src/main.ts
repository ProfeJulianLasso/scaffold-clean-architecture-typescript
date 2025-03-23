import { type INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { getConfig, initializeConfig } from './config';
import { InfrastructureModule } from './context/infrastructure/infrastructure.module';

// Inicializar configuración
initializeConfig();

/**
 * Configuración de la aplicación
 * @param app La instancia de la aplicación NestJS
 * @returns La instancia de la aplicación configurada
 */
function configureApp(app: INestApplication): INestApplication {
  // Aplicar helmet como middleware
  app.use(helmet());

  // Configuración de ValidationPipe
  app.useGlobalPipes();

  // Habilitar CORS
  app.enableCors();

  return app;
}

/**
 * Bootstrap de la aplicación NestJS
 * @returns Promise<void>
 */
async function bootstrap(): Promise<void> {
  try {
    const logger = new Logger('Bootstrap');
    logger.log('🏁 Iniciando aplicación...');

    // Crear aplicación NestJS
    const app = await NestFactory.create(InfrastructureModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Configurar aplicación
    const configuredApp = configureApp(app);

    // Obtener configuración desde el helper
    const config = getConfig();

    // Iniciar aplicación
    await configuredApp.listen(config.port);

    logger.log(
      `🚀 Aplicación ejecutándose en puerto ${config.port} (${config.nodeEnv})`,
    );
  } catch (error: unknown) {
    const logger = new Logger('Bootstrap');
    // Manejo seguro de error con verificación de tipo
    if (error instanceof Error) {
      logger.error(`🤯 Error al iniciar la aplicación: ${error.message}`);
    } else {
      logger.error('🤯 Error desconocido al iniciar la aplicación');
    }
    process.exit(1);
  }
}

// Ejecutar bootstrap solo cuando el archivo se ejecuta directamente
if (require.main === module) {
  // Usar void para manejar promesa explícitamente (evita no-floating-promises)
  void bootstrap();
}

// Exportar bootstrap para pruebas
export { bootstrap };
