import type { Result } from '@common/utils/result-pattern/result.pattern';
import { HttpStatus } from '@nestjs/common';
import { ResultResponseDTO } from '../dtos/result-response.dto';

/**
 * Factory para crear respuestas estándar de la API a partir de Result
 */
export const resultResponseFactory = {
  /**
   * Crea una respuesta estándar a partir de un Result
   * @param result - Resultado de la operación
   * @param successStatusCode - Código HTTP para casos de éxito
   * @returns DTO de respuesta estándar
   */
  createFromResult(
    result: Result<unknown>,
    successStatusCode: number = HttpStatus.OK,
  ): ResultResponseDTO {
    if (result.isSuccess()) {
      const value = result.getValue();
      const answer = new ResultResponseDTO();

      // Si el valor ya tiene un formato similar a la respuesta estándar
      if (typeof value === 'object' && value !== null && 'success' in value) {
        const success = value.success;
        const hasMessage =
          'message' in value && typeof value.message === 'string';
        const message = hasMessage ? value.message : 'Operación exitosa';
        answer.success = Boolean(success);
        answer.message = String(message);
        answer.statusCode = successStatusCode;
        answer.data = this.extractData(value as Record<string, unknown>);
        answer.statusCode = successStatusCode;
        return answer;
      }

      // Respuesta genérica de éxito
      answer.success = true;
      answer.message = 'Operación exitosa';
      if (typeof value === 'object' && value !== null) {
        answer.data = this.extractData(value as Record<string, unknown>);
      }
      if (value === null) {
        answer.data = {};
      }
      answer.statusCode = successStatusCode;
      return answer;
    }

    // Caso de error
    const error = result.getError();

    return {
      success: false,
      message: error.message,
      error: error.details?.code || error.type,
      statusCode: error.statusCode,
    };
  },

  /**
   * Extrae datos relevantes para la respuesta, evitando duplicación de campos
   * @param value - Valor original
   * @returns Objeto con los datos relevantes
   */
  extractData(value: Record<string, unknown>): Record<string, unknown> {
    const { success, message, ...data } = value;
    return Object.keys(data).length > 0 ? data : {};
  },
};
