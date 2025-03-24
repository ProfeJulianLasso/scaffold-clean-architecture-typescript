import {
  ErrorType,
  ResultException,
} from '@common/exceptions/result.exception';

/**
 * Clase especializada para excepciones que ocurren en la capa de dominio.
 * Representa errores relacionados con violaciones de reglas de negocio,
 * invariantes de entidades, políticas de dominio, etc.
 */
export class DomainException extends ResultException {
  /**
   * Crea una nueva instancia de DomainException.
   *
   * @param message - Mensaje descriptivo del error de dominio
   * @param options - Opciones adicionales para la excepción
   */
  constructor(
    message: string,
    options?: {
      code?: string;
      statusCode?: number;
      source?: string;
      metadata?: Record<string, unknown>;
      isOperational?: boolean;
      stack?: string;
    },
  ) {
    super(ErrorType.DOMAIN, message, {
      source: options?.source ?? 'domain',
      ...options,
    });

    Object.setPrototypeOf(this, DomainException.prototype);
    this.name = this.constructor.name;
  }

  /**
   * Crea una excepción de dominio a partir de una regla de negocio violada.
   *
   * @param rule - Nombre de la regla de negocio violada
   * @param details - Detalles sobre la violación
   * @returns Nueva instancia de DomainException
   */
  static fromBusinessRule(rule: string, details?: string): DomainException {
    const message = details
      ? `Regla de negocio violada: ${rule}. ${details}`
      : `Regla de negocio violada: ${rule}`;

    return new DomainException(message, {
      code: `BUSINESS_RULE_${rule.toUpperCase().replace(/\s+/g, '_')}`,
      metadata: { rule },
    });
  }

  /**
   * Crea una excepción para indicar que un valor requerido no existe o es inválido.
   *
   * @param entityName - Nombre de la entidad o valor objeto
   * @param property - Nombre de la propiedad afectada
   * @returns Nueva instancia de DomainException
   */
  static invalidValue(entityName: string, property: string): DomainException {
    return new DomainException(
      `El valor '${property}' para ${entityName} es inválido`,
      {
        code: 'INVALID_ENTITY_VALUE',
        metadata: { entityName, property },
      },
    );
  }

  /**
   * Crea una excepción para una operación no permitida en el estado actual de la entidad.
   *
   * @param entityName - Nombre de la entidad
   * @param operation - Operación que se intentó realizar
   * @param currentState - Estado actual de la entidad
   * @returns Nueva instancia de DomainException
   */
  static operationNotAllowed(
    entityName: string,
    operation: string,
    currentState?: string,
  ): DomainException {
    const message = currentState
      ? `La operación '${operation}' no está permitida para ${entityName} en estado '${currentState}'`
      : `La operación '${operation}' no está permitida para ${entityName}`;

    return new DomainException(message, {
      code: 'OPERATION_NOT_ALLOWED',
      metadata: { entityName, operation, currentState },
    });
  }
}
