/**
 * @fileoverview Sistema de excepciones y gestión de errores para la aplicación.
 * Este módulo proporciona una implementación consistente para el manejo de errores
 * a través de diferentes capas de la arquitectura.
 */

/**
 * Enumeración de los tipos de errores soportados por el sistema.
 * Permite categorizar las excepciones según su naturaleza.
 * @enum {string}
 */
export enum ErrorType {
  /** Errores de validación de datos de entrada */
  VALIDATION = "VALIDATION",
  /** Errores cuando un recurso no es encontrado */
  NOT_FOUND = "NOT_FOUND",
  /** Errores de conflicto, como duplicación de recursos */
  CONFLICT = "CONFLICT",
  /** Errores de autenticación */
  UNAUTHORIZED = "UNAUTHORIZED",
  /** Errores de autorización */
  FORBIDDEN = "FORBIDDEN",
  /** Errores internos del servidor */
  INTERNAL = "INTERNAL",
  /** Errores relacionados con la lógica de dominio */
  DOMAIN = "DOMAIN",
  /** Errores relacionados con la capa de aplicación */
  APPLICATION = "APPLICATION",
  /** Errores relacionados con la capa de infraestructura */
  INFRASTRUCTURE = "INFRASTRUCTURE",
}

/**
 * Interfaz que define la estructura de los detalles de un error.
 * @interface
 */
export interface IErrorDetails {
  /** Código identificador del error */
  code: string;
  /** Mensaje descriptivo del error */
  message: string;
  /** Origen o componente donde se produjo el error */
  source?: string;
  /** Marca de tiempo cuando ocurrió el error */
  timestamp?: Date;
  /** Datos adicionales relacionados con el error */
  metadata?: Record<string, unknown>;
  /** Traza de la pila de ejecución */
  stack?: string;
}

/**
 * Clase principal para el manejo de excepciones en la aplicación.
 * Extiende la clase Error nativa proporcionando funcionalidades adicionales
 * para categorización, contextualización y serialización de errores.
 */
export class ResultException extends Error {
  /** Tipo de error según la enumeración ErrorType */
  readonly type: ErrorType;
  /** Detalles estructurados del error */
  readonly details: IErrorDetails;
  /** Código de estado HTTP asociado al error */
  readonly statusCode: number;
  /** Indica si el error es operacional (esperado) o programático (inesperado) */
  readonly isOperational: boolean;

  /**
   * Constructor para crear una nueva instancia de ResultException.
   *
   * @param type - Tipo de error según la enumeración ErrorType
   * @param message - Mensaje descriptivo del error
   * @param options - Opciones de configuración adicionales para el error
   * @param options.code - Código personalizado del error (por defecto usa el tipo)
   * @param options.statusCode - Código de estado HTTP personalizado
   * @param options.source - Origen o componente donde se generó el error
   * @param options.metadata - Datos adicionales relacionados con el error
   * @param options.isOperational - Indica si es un error operacional o programático
   * @param options.stack - Traza de la pila de ejecución personalizada
   */
  constructor(
    type: ErrorType,
    message: string,
    options?: {
      code?: string;
      statusCode?: number;
      source?: string;
      metadata?: Record<string, unknown>;
      isOperational?: boolean;
      stack?: string;
    }
  ) {
    super(message);
    Object.setPrototypeOf(this, ResultException.prototype);

    this.name = this.constructor.name;
    this.type = type;
    this.details = {
      code: options?.code ?? type,
      message: message,
      source: options?.source ?? "unknown",
      timestamp: new Date(),
      metadata: options?.metadata || {},
      stack: options?.stack ?? this.stack,
    };
    this.statusCode = options?.statusCode ?? this.resolveStatusCode(type);
    this.isOperational =
      options?.isOperational !== undefined ? options.isOperational : true;
  }

  /**
   * Determina el código de estado HTTP apropiado basado en el tipo de error.
   *
   * @param type - Tipo de error para el cual determinar el código de estado
   * @returns Código de estado HTTP correspondiente al tipo de error
   * @private
   */
  private resolveStatusCode(type: ErrorType): number {
    const statusCodeMap: Record<ErrorType, number> = {
      [ErrorType.VALIDATION]: 400,
      [ErrorType.NOT_FOUND]: 404,
      [ErrorType.CONFLICT]: 409,
      [ErrorType.UNAUTHORIZED]: 401,
      [ErrorType.FORBIDDEN]: 403,
      [ErrorType.INTERNAL]: 500,
      [ErrorType.DOMAIN]: 422,
      [ErrorType.APPLICATION]: 500,
      [ErrorType.INFRASTRUCTURE]: 500,
    };

    return statusCodeMap[type];
  }

  /**
   * Serializa la excepción a un objeto JSON para respuestas de API.
   * En entorno de producción, omite la traza de la pila por seguridad.
   *
   * @returns Detalles del error en formato JSON
   */
  public toJSON(): IErrorDetails {
    return {
      ...this.details,
      stack: process.env.NODE_ENV === "production" ? undefined : this.stack,
    };
  }

  /**
   * Convierte un error estándar en una instancia de ResultException.
   * Si el error ya es una instancia de ResultException, la retorna sin modificar.
   *
   * @param error - Error a convertir
   * @param type - Tipo de error a asignar (por defecto INTERNAL)
   * @returns Una instancia de ResultException
   * @static
   */
  public static fromError(
    error: Error,
    type: ErrorType = ErrorType.INTERNAL
  ): ResultException {
    if (error instanceof ResultException) {
      return error;
    }

    return new ResultException(type, error.message, {
      metadata: { originalError: error.name },
      stack: error.stack,
    });
  }
}
