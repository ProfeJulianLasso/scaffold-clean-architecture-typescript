import { ErrorType, ResultException } from '@common/exceptions';

/**
 * Representa un error específico de validación
 */
export interface IValidationError {
  /** Mensaje descriptivo del error */
  message: string;
  /** Propiedad o campo que causó el error (opcional) */
  property: string;
  /** Metadatos adicionales relacionados con el error (opcional) */
  metadata?: Record<string, unknown>;
}

/**
 * Clase abstracta para manejar y recolectar errores de validación.
 * Permite acumular errores durante el proceso de validación y luego
 * acceder a ellos cuando sea necesario.
 */
export abstract class ValidationHandler {
  private _errors: IValidationError[] = [];

  /**
   * Registra un nuevo error de validación
   *
   * @param error - Error de validación a registrar
   */
  protected addError(error: IValidationError): void {
    this._errors.push(error);
  }

  /**
   * Registra un error con la información proporcionada
   *
   * @param message - Mensaje descriptivo
   * @param property - Propiedad que causó el error (opcional)
   * @param metadata - Metadatos adicionales (opcional)
   */
  protected reportError(
    message: string,
    property: string,
    metadata?: Record<string, unknown>,
  ): void {
    this.addError({
      message,
      property,
      metadata,
    });
  }

  /**
   * Verifica si hay errores registrados
   *
   * @returns true si hay al menos un error, false en caso contrario
   */
  public hasErrors(): boolean {
    return this._errors.length > 0;
  }

  /**
   * Obtiene todos los errores registrados
   *
   * @returns Array con todos los errores de validación
   */
  public getErrors(): IValidationError[] {
    return [...this._errors];
  }

  /**
   * Lanza una excepción si hay errores de validación
   *
   * @param entityName - Nombre de la entidad o valor objeto que se está validando
   * @throws {ResultException} Si hay errores de validación registrados
   */
  public throwIfHasErrors(entityName: string): void {
    if (this.hasErrors()) {
      throw new ResultException(
        ErrorType.VALIDATION,
        `Errores de validación en ${entityName}`,
        {
          code: 'VALIDATION_ERRORS',
          metadata: { errors: this._errors },
        },
      );
    }
  }

  /**
   * Combina los errores de otro handler con este
   *
   * @param handler - Otro handler cuyos errores se añadirán a este
   */
  public combineWith(handler: ValidationHandler): void {
    if (handler.hasErrors()) {
      this._errors = [...this._errors, ...handler.getErrors()];
    }
  }

  /**
   * Limpia todos los errores registrados
   */
  public clearErrors(): void {
    this._errors = [];
  }
}
