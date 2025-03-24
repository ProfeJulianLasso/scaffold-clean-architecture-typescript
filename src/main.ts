import { type INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { getConfig, initializeConfig } from './main.config';

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
 * Configuración de Swagger para documentación de la API
 * @param app La instancia de la aplicación NestJS
 */
function configureSwagger(app: INestApplication): void {
  const options = new DocumentBuilder()
    .setTitle('API de Autenticación')
    .setDescription('API para gestión de usuarios y autenticación')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/docs', app, document);
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
    const app = await NestFactory.create(AppModule, {
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
