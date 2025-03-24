import { ResultException } from '@common/exceptions/result.exception';
import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

/**
 * Filtro para convertir ResultException a respuestas HTTP
 */
@Catch(ResultException)
export class ResultExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ResultExceptionFilter.name);

  /**
   * Procesa la excepción y genera una respuesta HTTP adecuada
   * @param exception - Excepción capturada
   * @param host - Contexto de la solicitud
   */
  catch(exception: ResultException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;

    // Registrar el error
    this.logger.error(
      `${exception.name}: ${exception.message}`,
      exception.details,
    );

    // Respuesta estándar
    response.status(status).json({
      success: false,
      message: exception.message,
      error: exception.details.code || exception.type,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
    });
  }
}
