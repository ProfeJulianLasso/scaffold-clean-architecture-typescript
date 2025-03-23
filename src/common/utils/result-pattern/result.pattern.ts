/**
 * @fileoverview Implementación del patrón Result para manejo de resultados de operaciones.
 * Este módulo encapsula tanto el éxito como el fracaso de las operaciones, proporcionando
 * una interfaz consistente y declarativa para el manejo de errores en la aplicación.
 */

import { ErrorType, ResultException } from '@common/exceptions';

/**
 * Clase genérica que representa el resultado de una operación.
 * Puede contener un valor exitoso o un error, pero nunca ambos.
 *
 * @template SuccessValue Tipo del valor en caso de éxito
 */
export class Result<SuccessValue> {
  private readonly _isSuccess: boolean;
  private readonly _value?: SuccessValue;
  private readonly _error?: ResultException;

  /**
   * Constructor privado. Usa los métodos estáticos success y failure para crear instancias.
   */
  private constructor(
    isSuccess: boolean,
    value?: SuccessValue,
    error?: ResultException,
  ) {
    this._isSuccess = isSuccess;
    this._value = value;
    this._error = error;
  }

  /**
   * Verifica si el resultado es exitoso.
   */
  isSuccess(): boolean {
    return this._isSuccess;
  }

  /**
   * Verifica si el resultado es fallido.
   */
  isFailure(): boolean {
    return !this._isSuccess;
  }

  /**
   * Obtiene el valor del resultado exitoso.
   * @throws Error si se intenta obtener el valor de un resultado fallido
   */
  getValue(): SuccessValue {
    if (!this._isSuccess) {
      throw new Error('No se puede obtener el valor de un resultado fallido');
    }
    return this._value as SuccessValue;
  }

  /**
   * Obtiene el error de un resultado fallido.
   * @throws Error si se intenta obtener el error de un resultado exitoso
   */
  getError(): ResultException {
    if (this._isSuccess) {
      throw new Error('No se puede obtener el error de un resultado exitoso');
    }
    return this._error as ResultException;
  }

  /**
   * Crea un resultado exitoso con el valor proporcionado.
   *
   * @param value - Valor a encapsular en el resultado exitoso
   * @returns Una nueva instancia de Result representando un éxito
   */
  static success<SuccessValue>(value?: SuccessValue): Result<SuccessValue> {
    return new Result<SuccessValue>(true, value);
  }

  /**
   * Crea un resultado fallido con la excepción proporcionada.
   *
   * @param error - Excepción a encapsular en el resultado fallido
   * @returns Una nueva instancia de Result representando un fallo
   */
  static failure<SuccessValue>(error: ResultException): Result<SuccessValue> {
    return new Result<SuccessValue>(false, undefined, error);
  }

  /**
   * Crea un resultado fallido a partir de un mensaje y tipo de error.
   *
   * @param type - Tipo de error según la enumeración ErrorType
   * @param message - Mensaje descriptivo del error
   * @param options - Opciones adicionales para la excepción
   * @returns Una nueva instancia de Result representando un fallo
   */
  static fail<SuccessValue>(
    type: ErrorType,
    message: string,
    options?: {
      code?: string;
      statusCode?: number;
      source?: string;
      metadata?: Record<string, unknown>;
      isOperational?: boolean;
      stack?: string;
    },
  ): Result<SuccessValue> {
    return Result.failure<SuccessValue>(
      new ResultException(type, message, options),
    );
  }

  /**
   * Crea un resultado a partir de una función que puede lanzar excepciones.
   *
   * @param fn - Función que puede lanzar excepciones
   * @returns Un resultado exitoso o un resultado fallido con la excepción capturada
   */
  static try<SuccessValue>(fn: () => SuccessValue): Result<SuccessValue> {
    try {
      return Result.success(fn());
    } catch (error) {
      // Caso 1: El error ya es una ResultException
      if (error instanceof ResultException) {
        return Result.failure<SuccessValue>(error);
      }

      // Caso 2: Error estándar de JavaScript
      if (error instanceof Error) {
        return Result.failure<SuccessValue>(ResultException.fromError(error));
      }

      // Caso 3: Cualquier otro tipo de error
      return Result.failure<SuccessValue>(
        new ResultException(ErrorType.INTERNAL, 'Error desconocido', {
          metadata: { originalError: error },
        }),
      );
    }
  }

  /**
   * Crea un resultado a partir de una función asíncrona que puede lanzar excepciones.
   * Preserva los detalles del error original independientemente de su origen.
   *
   * @param fn - Función asíncrona que puede lanzar excepciones
   * @param errorTypeMap - Función opcional para determinar el tipo de error según la excepción
   * @returns Una promesa que resuelve a un resultado exitoso o un resultado fallido con la excepción capturada
   */
  static async tryAsync<SuccessValue>(
    fn: () => Promise<SuccessValue>,
    errorTypeMap?: (error: unknown) => ErrorType,
  ): Promise<Result<SuccessValue>> {
    try {
      const value = await fn();
      return Result.success(value);
    } catch (error: unknown) {
      return Result.handleAsyncError<SuccessValue>(error, errorTypeMap);
    }
  }

  /**
   * Método privado que maneja la transformación de diferentes tipos de errores
   * en un Result fallido apropiado.
   */
  private static handleAsyncError<SuccessValue>(
    error: unknown,
    errorTypeMap?: (error: unknown) => ErrorType,
  ): Result<SuccessValue> {
    // Caso 1: ResultException
    if (error instanceof ResultException) {
      return Result.failure<SuccessValue>(error);
    }

    // Caso 2: Error estándar de JavaScript
    if (error instanceof Error) {
      return Result.handleStandardError<SuccessValue>(error, errorTypeMap);
    }

    // Caso 3: Cualquier otro tipo de error
    return Result.handleUnknownError<SuccessValue>(error, errorTypeMap);
  }

  /**
   * Maneja errores estándar de JavaScript, extrayendo propiedades adicionales
   */
  private static handleStandardError<SuccessValue>(
    error: Error,
    errorTypeMap?: (error: unknown) => ErrorType,
  ): Result<SuccessValue> {
    const errorType = errorTypeMap ? errorTypeMap(error) : ErrorType.INTERNAL;
    const additionalProps = Result.extractAdditionalProperties(error);

    return Result.failure<SuccessValue>(
      new ResultException(errorType, error.message, {
        code: error.name,
        metadata: {
          originalError: error,
          name: error.name,
          stack: error.stack,
          errorType: error.constructor.name,
          ...additionalProps,
        },
      }),
    );
  }

  /**
   * Extrae propiedades no estándar de un objeto Error
   */
  private static extractAdditionalProperties(
    error: Error,
  ): Record<string, unknown> {
    const additionalProps: Record<string, unknown> = {};

    for (const prop of Object.getOwnPropertyNames(error)) {
      if (prop !== 'name' && prop !== 'message' && prop !== 'stack') {
        additionalProps[prop] = (error as unknown as Record<string, unknown>)[
          prop
        ];
      }
    }

    return additionalProps;
  }

  /**
   * Maneja errores de tipo desconocido (no Error ni ResultException)
   */
  private static handleUnknownError<SuccessValue>(
    error: unknown,
    errorTypeMap?: (error: unknown) => ErrorType,
  ): Result<SuccessValue> {
    const errorType = errorTypeMap ? errorTypeMap(error) : ErrorType.INTERNAL;
    const errorMessage =
      typeof error === 'string' ? error : 'Error desconocido';

    return Result.failure<SuccessValue>(
      new ResultException(errorType, errorMessage, {
        metadata: {
          originalError: error,
          errorType: typeof error,
        },
      }),
    );
  }

  /**
   * Transforma el valor de un resultado exitoso mediante una función.
   * Si el resultado es fallido, devuelve el resultado fallido sin cambios.
   *
   * @param fn - Función de transformación
   * @returns Un nuevo resultado con el valor transformado o el mismo error
   */
  map<MappedValue>(
    fn: (value: SuccessValue) => MappedValue,
  ): Result<MappedValue> {
    if (this.isFailure()) {
      return Result.failure<MappedValue>(this.getError());
    }

    try {
      return Result.success(fn(this.getValue()));
    } catch (error) {
      if (error instanceof ResultException) {
        return Result.failure<MappedValue>(error);
      }
      return Result.failure<MappedValue>(
        ResultException.fromError(
          error instanceof Error ? error : new Error(String(error)),
        ),
      );
    }
  }

  /**
   * Encadena resultados, aplicando una función que devuelve un nuevo resultado.
   *
   * @param fn - Función que transforma el valor y devuelve un nuevo Result
   * @returns El nuevo Result o el Result fallido original
   */
  flatMap<ChainedValue>(
    fn: (value: SuccessValue) => Result<ChainedValue>,
  ): Result<ChainedValue> {
    if (this.isFailure()) {
      return Result.failure<ChainedValue>(this.getError());
    }

    try {
      return fn(this.getValue());
    } catch (error) {
      if (error instanceof ResultException) {
        return Result.failure<ChainedValue>(error);
      }
      return Result.failure<ChainedValue>(
        ResultException.fromError(
          error instanceof Error ? error : new Error(String(error)),
        ),
      );
    }
  }

  /**
   * Aplica una función al resultado, ya sea exitoso o fallido.
   *
   * @param onSuccess - Función a ejecutar si el resultado es exitoso
   * @param onFailure - Función a ejecutar si el resultado es fallido
   * @returns El valor devuelto por la función correspondiente
   */
  fold<FoldedValue>(
    onSuccess: (value: SuccessValue) => FoldedValue,
    onFailure: (error: ResultException) => FoldedValue,
  ): FoldedValue {
    return this.isSuccess()
      ? onSuccess(this.getValue())
      : onFailure(this.getError());
  }

  /**
   * Recupera de un error aplicando una función de recuperación.
   *
   * @param fn - Función de recuperación que toma el error y devuelve un nuevo resultado
   * @returns El resultado original si es exitoso, o el resultado de la recuperación
   */
  recover(
    fn: (error: ResultException) => Result<SuccessValue>,
  ): Result<SuccessValue> {
    if (this.isSuccess()) {
      return this;
    }

    try {
      return fn(this.getError());
    } catch (error) {
      if (error instanceof ResultException) {
        return Result.failure<SuccessValue>(error);
      }
      return Result.failure<SuccessValue>(
        ResultException.fromError(
          error instanceof Error ? error : new Error(String(error)),
        ),
      );
    }
  }

  /**
   * Ejecuta una acción si el resultado es exitoso.
   *
   * @param action - Acción a ejecutar con el valor del resultado
   * @returns El mismo resultado para permitir encadenamientos
   */
  onSuccess(action: (value: SuccessValue) => void): this {
    if (this.isSuccess()) {
      try {
        action(this.getValue());
      } catch (error) {
        // Solo registramos el error, manteniendo el flujo del resultado original
        console.error('Error en el manejador onSuccess:', error);
      }
    }
    return this;
  }

  /**
   * Ejecuta una acción si el resultado es fallido.
   *
   * @param action - Acción a ejecutar con el error del resultado
   * @returns El mismo resultado para permitir encadenamientos
   */
  onFailure(action: (error: ResultException) => void): this {
    if (this.isFailure()) {
      try {
        action(this.getError());
      } catch (error) {
        // Solo registramos el error, manteniendo el flujo del resultado original
        console.error('Error en el manejador onFailure:', error);
      }
    }
    return this;
  }

  /**
   * Lanza una excepción si el resultado es fallido, o devuelve el valor si es exitoso.
   *
   * @returns El valor del resultado exitoso
   * @throws ResultException si el resultado es fallido
   */
  unwrap(): SuccessValue {
    if (this.isFailure()) {
      throw this.getError();
    }
    return this.getValue();
  }

  /**
   * Devuelve el valor del resultado o un valor por defecto si es fallido.
   *
   * @param defaultValue - Valor a devolver si el resultado es fallido
   * @returns El valor del resultado o el valor por defecto
   */
  unwrapOr(defaultValue: SuccessValue): SuccessValue {
    return this.isSuccess() ? this.getValue() : defaultValue;
  }

  /**
   * Combina múltiples resultados en uno solo.
   *
   * @param results - Lista de resultados a combinar
   * @returns Un resultado exitoso con array de valores o el primer resultado fallido
   */
  static combine<ItemValue>(results: Result<ItemValue>[]): Result<ItemValue[]> {
    const values: ItemValue[] = [];

    for (const result of results) {
      if (result.isFailure()) {
        return Result.failure(result.getError());
      }
      values.push(result.getValue());
    }

    return Result.success(values);
  }
}
