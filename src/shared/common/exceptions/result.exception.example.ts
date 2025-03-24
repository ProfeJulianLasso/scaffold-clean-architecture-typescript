/**
 * @fileoverview Ejemplos de uso de ResultException en diferentes escenarios
 * Este archivo contiene ejemplos prácticos para demostrar cómo utilizar
 * la clase ResultException adecuadamente en una aplicación.
 */

import { ErrorType, ResultException } from './result.exception';

/**
 * Ejemplo 1: Uso básico de ResultException
 * Muestra la creación y lanzamiento de excepciones con parámetros mínimos
 */
export function basicExceptionExample(): void {
  try {
    // Lanzar excepción de validación básica
    throw new ResultException(
      ErrorType.VALIDATION,
      'El campo email debe ser una dirección válida',
    );
  } catch (error) {
    if (error instanceof ResultException) {
      console.log('Tipo de error:', error.type);
      console.log('Mensaje:', error.message);
      console.log('Código de estado HTTP:', error.statusCode);
      console.log('¿Es operacional?:', error.isOperational);
    }
  }
}

/**
 * Diferentes tipos de errores
 * Funciones para crear excepciones para diferentes escenarios
 * @module errorExamples
 */
export const errorExamples = {
  /**
   * Ejemplo de error de validación
   * @param fieldName Nombre del campo que falló la validación
   * @param value Valor inválido
   */
  createValidationError(fieldName: string, value: unknown): ResultException {
    return new ResultException(
      ErrorType.VALIDATION,
      `El campo '${fieldName}' tiene un valor inválido: ${String(value)}`,
      {
        code: 'INVALID_INPUT',
        source: 'validation-service',
        metadata: { field: fieldName, receivedValue: value },
      },
    );
  },

  /**
   * Ejemplo de error de recurso no encontrado
   * @param resourceType Tipo de recurso (usuario, producto, etc.)
   * @param resourceId Identificador del recurso
   */
  createNotFoundError(
    resourceType: string,
    resourceId: string,
  ): ResultException {
    return new ResultException(
      ErrorType.NOT_FOUND,
      `El ${resourceType} con ID '${resourceId}' no fue encontrado`,
      {
        code: `${resourceType.toUpperCase()}_NOT_FOUND`,
        source: 'data-access-layer',
        metadata: { resourceType, resourceId },
      },
    );
  },

  /**
   * Ejemplo de error de conflicto (e.g., entidad duplicada)
   * @param resourceType Tipo de recurso
   * @param uniqueField Campo único que causó el conflicto
   * @param value Valor que causó el conflicto
   */
  createConflictError(
    resourceType: string,
    uniqueField: string,
    value: string,
  ): ResultException {
    return new ResultException(
      ErrorType.CONFLICT,
      `Ya existe un ${resourceType} con ${uniqueField}: '${value}'`,
      {
        code: `${resourceType.toUpperCase()}_ALREADY_EXISTS`,
        source: 'repository-service',
        metadata: { resourceType, field: uniqueField, value },
      },
    );
  },

  /**
   * Ejemplo de error de autenticación
   */
  createUnauthorizedError(): ResultException {
    return new ResultException(
      ErrorType.UNAUTHORIZED,
      'Credenciales de autenticación inválidas o faltantes',
      {
        code: 'INVALID_CREDENTIALS',
        source: 'auth-service',
      },
    );
  },

  /**
   * Ejemplo de error de autorización
   * @param userId ID del usuario
   * @param resource Recurso al que se intentó acceder
   * @param requiredPermission Permiso requerido
   */
  createForbiddenError(
    userId: string,
    resource: string,
    requiredPermission: string,
  ): ResultException {
    return new ResultException(
      ErrorType.FORBIDDEN,
      'No tiene permiso para acceder a este recurso',
      {
        code: 'INSUFFICIENT_PERMISSIONS',
        source: 'authorization-service',
        metadata: {
          userId,
          resource,
          requiredPermission,
          actualPermissions: [], // Aquí podrían ir los permisos reales
        },
      },
    );
  },

  /**
   * Ejemplo de error de dominio (reglas de negocio)
   * @param businessRule Regla de negocio violada
   * @param details Detalles sobre la violación de la regla
   */
  createDomainError(
    businessRule: string,
    details: Record<string, unknown>,
  ): ResultException {
    return new ResultException(
      ErrorType.DOMAIN,
      `Violación de regla de negocio: ${businessRule}`,
      {
        code: 'BUSINESS_RULE_VIOLATION',
        source: 'domain-service',
        metadata: { businessRule, ...details },
      },
    );
  },
};

/**
 * Ejemplo 3: Conversión de errores estándar a ResultException
 * @param operation Operación que se estaba realizando
 */
export function convertStandardError(operation: string): void {
  try {
    // Simulación de error estándar
    throw new Error(`Error al realizar ${operation}`);
  } catch (error) {
    // Convertir error estándar a ResultException
    const resultError = ResultException.fromError(
      error as Error,
      ErrorType.APPLICATION,
    );

    console.log('Error convertido:', resultError.type);
    console.log('Mensaje original preservado:', resultError.message);
    console.log('Código de estado:', resultError.statusCode);
    console.log('Detalles:', resultError.details);
  }
}

/**
 * Ejemplo 4: Serialización a JSON para respuestas de API
 * @param error El error a serializar
 */
export function serializeErrorForApiResponse(
  error: ResultException,
): Record<string, unknown> {
  // Convertir a formato adecuado para respuesta API
  const errorResponse = {
    status: 'error',
    statusCode: error.statusCode,
    error: error.toJSON(),
  };

  return errorResponse;
}

/**
 * Ejemplo 5: Uso en controladores o handlers HTTP
 * @param userId ID de usuario proporcionado
 */
export class UserController {
  async getUser(userId: string): Promise<Record<string, unknown>> {
    try {
      // Simular búsqueda de usuario
      const user = await this.findUserById(userId);
      return { status: 'success', data: user };
    } catch (error) {
      // Manejar el error apropiadamente
      if (error instanceof ResultException) {
        return serializeErrorForApiResponse(error);
      }

      // Convertir otros errores a ResultException
      const resultError = ResultException.fromError(error as Error);
      return serializeErrorForApiResponse(resultError);
    }
  }

  private async findUserById(userId: string): Promise<Record<string, unknown>> {
    // Simulación: Usuario no encontrado
    if (userId === '999') {
      throw errorExamples.createNotFoundError('usuario', userId);
    }

    // Simulación: Error interno
    if (userId === '000') {
      throw new Error('Error inesperado en la base de datos');
    }

    // Simulación: Usuario encontrado
    return Promise.resolve({
      id: userId,
      name: 'Usuario Ejemplo',
      email: 'usuario@ejemplo.com',
    });
  }
}

/**
 * Ejemplo 6: Uso en servicios de dominio
 */
export class TransferService {
  async transferFunds(
    sourceAccountId: string,
    targetAccountId: string,
    amount: number,
  ): Promise<void> {
    try {
      // Validación básica
      if (amount <= 0) {
        throw new ResultException(
          ErrorType.VALIDATION,
          'El monto de transferencia debe ser mayor que cero',
          {
            code: 'INVALID_TRANSFER_AMOUNT',
            source: 'transfer-service',
            metadata: { receivedAmount: amount },
          },
        );
      }

      const sourceAccount = await this.getAccount(sourceAccountId);

      // Verificar fondos suficientes (regla de dominio)
      if (sourceAccount.balance < amount) {
        throw errorExamples.createDomainError('FONDOS_INSUFICIENTES', {
          accountId: sourceAccountId,
          currentBalance: sourceAccount.balance,
          requiredAmount: amount,
          deficit: amount - sourceAccount.balance,
        });
      }

      // Continuar con la transferencia...
    } catch (error) {
      // Convertir y re-lanzar para manejo centralizado
      if (error instanceof ResultException) {
        throw error;
      }

      throw ResultException.fromError(error as Error, ErrorType.APPLICATION);
    }
  }

  private async getAccount(
    accountId: string,
  ): Promise<{ id: string; balance: number }> {
    // Simulación de cuenta
    return Promise.resolve({ id: accountId, balance: 100 });
  }
}

/**
 * Ejemplo 7: Middleware para manejo centralizado de errores (Express)
 * Este es un ejemplo de cómo se podría implementar un middleware para Express
 * que maneje centralizadamente todos los errores convertidos a ResultException
 */
// Definir una interfaz para los parámetros del middleware
interface Request {
  path: string;
  method: string;
}

interface Response {
  status(code: number): Response;
  json(body: Record<string, unknown>): void;
}

export function errorHandlerMiddleware(
  error: Error | ResultException,
  req: Request,
  res: Response,
  next: unknown,
): void {
  // Convertir a ResultException si no lo es ya
  const resultError =
    error instanceof ResultException ? error : ResultException.fromError(error);

  // Registrar el error (ejemplo simple)
  console.error('Error capturado:', {
    type: resultError.type,
    message: resultError.message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Enviar respuesta apropiada basada en el error
  res.status(resultError.statusCode).json({
    status: 'error',
    ...resultError.toJSON(),
  });
}

/**
 * Ejemplo 8: Uso en una capa de repositorio
 */
export class UserRepository {
  async findByEmail(email: string): Promise<Record<string, unknown>> {
    try {
      // Simulación: Error de base de datos
      if (email.includes('error')) {
        throw new Error('Error de conexión a la base de datos');
      }

      // Simulación: Usuario no encontrado
      if (email === 'noexiste@ejemplo.com') {
        throw new ResultException(
          ErrorType.NOT_FOUND,
          `No se encontró un usuario con email: ${email}`,
          {
            code: 'USER_EMAIL_NOT_FOUND',
            source: 'user-repository',
            metadata: { email },
          },
        );
      }

      // Simulación: Usuario encontrado
      return Promise.resolve({
        id: '123',
        email,
        name: 'Usuario Ejemplo',
      });
    } catch (error) {
      // Gestionar errores específicos de infraestructura
      if (!(error instanceof ResultException)) {
        throw new ResultException(
          ErrorType.INFRASTRUCTURE,
          'Error al acceder a la base de datos de usuarios',
          {
            code: 'DATABASE_ERROR',
            source: 'user-repository',
            metadata: {
              operation: 'findByEmail',
              originalError: (error as Error).message,
            },
            isOperational: false, // Error no operacional, requiere atención
          },
        );
      }

      // Propagamos ResultException ya formateadas
      throw error;
    }
  }
}

/**
 * Ejemplo 9: Demostración del uso de la propiedad isOperational
 * para diferenciar errores esperados de los inesperados
 */
export function demonstrateOperationalVsProgrammatic(): void {
  // Error operacional (esperado, manejable)
  const operationalError = new ResultException(
    ErrorType.VALIDATION,
    'Formato de fecha inválido',
    {
      isOperational: true, // Por defecto es true, pero lo explicitamos
      metadata: { expectedFormat: 'YYYY-MM-DD' },
    },
  );

  // Error programático (inesperado, posible bug)
  const programmaticError = new ResultException(
    ErrorType.INTERNAL,
    'Error inesperado en el sistema de caché',
    {
      isOperational: false,
      code: 'CACHE_SYSTEM_FAILURE',
      source: 'cache-manager',
    },
  );

  // En una aplicación real, los errores programáticos podrían
  // necesitar notificación inmediata al equipo de desarrollo
  console.log('Operacional:', operationalError.isOperational);
  console.log('Programático:', programmaticError.isOperational);
}
