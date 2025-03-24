import * as dotenv from 'dotenv';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Determinar la ruta del archivo .env
const envPath = path.resolve(process.cwd(), '.env');

// Verificar si el archivo existe
export function initializeConfig(): void {
  const logger = console;

  if (fs.existsSync(envPath)) {
    logger.log(`Cargando variables de entorno desde: ${envPath}`);
    const result = dotenv.config({ path: envPath });

    if (result.error) {
      logger.error(`Error al cargar .env: ${result.error.message}`);
      return;
    }

    logger.log('Variables de entorno cargadas correctamente');
    logger.log(`PORT=${process.env.PORT ?? 'no definido'}`);
  } else {
    logger.warn(`Archivo .env no encontrado en: ${envPath}`);
    logger.warn('Usando valores por defecto');
  }
}

// Obtener la configuración como un objeto
export function getConfig(): { port: number; nodeEnv: string } {
  return {
    port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000,
    nodeEnv: process.env.NODE_ENV ?? 'development',
  };
}
