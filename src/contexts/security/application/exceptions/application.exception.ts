import {
  ErrorType,
  ResultException,
} from '@common/exceptions/result.exception';

/**
 * Clase especializada para excepciones que ocurren en la capa de aplicación.
 * Representa errores relacionados con casos de uso, servicios de aplicación,
 * orquestación de flujos de trabajo, manejo de comandos/eventos, etc.
 */
export class ApplicationException extends ResultException {
  /**
   * Crea una nueva instancia de ApplicationException.
   *
   * @param message - Mensaje descriptivo del error de aplicación
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
    super(ErrorType.APPLICATION, message, {
      source: options?.source ?? 'application',
      ...options,
    });

    Object.setPrototypeOf(this, ApplicationException.prototype);
    this.name = this.constructor.name;
  }

  /**
   * Crea una excepción para errores durante la ejecución de un caso de uso.
   *
   * @param useCaseName - Nombre del caso de uso
   * @param details - Detalles sobre el problema encontrado
   * @returns Nueva instancia de ApplicationException
   */
  static useCaseError(
    useCaseName: string,
    details?: string,
  ): ApplicationException {
    const message = details
      ? `Error en caso de uso '${useCaseName}': ${details}`
      : `Error en caso de uso '${useCaseName}'`;

    return new ApplicationException(message, {
      code: 'USE_CASE_ERROR',
      metadata: { useCaseName },
    });
  }

  /**
   * Crea una excepción para errores relacionados con datos de entrada inválidos.
   *
   * @param useCaseOrService - Nombre del caso de uso o servicio
   * @param inputName - Nombre del parámetro o entrada inválida
   * @param reason - Razón por la que la entrada es inválida
   * @returns Nueva instancia de ApplicationException
   */
  static invalidInput(
    useCaseOrService: string,
    inputName: string,
    reason?: string,
  ): ApplicationException {
    const message = reason
      ? `Entrada inválida '${inputName}' en '${useCaseOrService}': ${reason}`
      : `Entrada inválida '${inputName}' en '${useCaseOrService}'`;

    return new ApplicationException(message, {
      code: 'INVALID_INPUT',
      metadata: { useCaseOrService, inputName, reason },
    });
  }

  /**
   * Crea una excepción para errores de acceso a recursos externos o dependencias.
   *
   * @param dependency - Nombre del servicio o dependencia externa
   * @param operation - Operación que falló
   * @param details - Detalles adicionales sobre el fallo
   * @returns Nueva instancia de ApplicationException
   */
  static dependencyFailure(
    dependency: string,
    operation: string,
    details?: string,
  ): ApplicationException {
    const message = details
      ? `Error al acceder a '${dependency}' durante '${operation}': ${details}`
      : `Error al acceder a '${dependency}' durante '${operation}'`;

    return new ApplicationException(message, {
      code: 'DEPENDENCY_FAILURE',
      metadata: { dependency, operation },
    });
  }

  /**
   * Crea una excepción para violaciones de flujo de la aplicación.
   *
   * @param process - Nombre del proceso o flujo
   * @param step - Paso o etapa donde ocurrió la violación
   * @param expectedState - Estado esperado
   * @returns Nueva instancia de ApplicationException
   */
  static workflowViolation(
    process: string,
    step: string,
    expectedState?: string,
  ): ApplicationException {
    const message = expectedState
      ? `Violación del flujo '${process}' en paso '${step}'. Estado esperado: ${expectedState}`
      : `Violación del flujo '${process}' en paso '${step}'`;

    return new ApplicationException(message, {
      code: 'WORKFLOW_VIOLATION',
      metadata: { process, step, expectedState },
    });
  }
}
