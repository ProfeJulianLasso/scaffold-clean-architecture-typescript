/* eslint-disable no-unused-vars */
import { ValueObject } from './value-object.abstract';

/**
 * Interfaz para configurar las validaciones del BooleanValueObject
 */
export interface BooleanValueObjectOptions {
  /** Nombre personalizado para el objeto */
  objectName?: string;
  /** Si se debe permitir null o undefined (convertido al valor por defecto) */
  allowNull?: boolean;
  /** Valor por defecto cuando el valor es null/undefined (requiere allowNull=true) */
  defaultValue?: boolean;
  /** Función de validación personalizada */
  customValidator?: (value: boolean) => { valid: boolean; message?: string };
  /** Si se debe convertir valores no booleanos a booleanos */
  convertValues?: boolean;
}

/**
 * Clase base abstracta para Value Objects de tipo boolean.
 * Proporciona validaciones comunes para valores booleanos.
 */
export abstract class BooleanValueObject extends ValueObject<boolean> {
  private readonly _options: BooleanValueObjectOptions;

  /**
   * Crea una nueva instancia de BooleanValueObject
   *
   * @param value - El valor booleano a encapsular
   * @param options - Opciones de configuración para las validaciones
   */
  constructor(
    value: boolean | null | undefined,
    options: BooleanValueObjectOptions = {},
  ) {
    // Procesamos el valor según las opciones
    let processedValue: boolean;

    if (value === null || value === undefined) {
      // Si se permite null/undefined, usamos el valor por defecto
      if (options.allowNull) {
        processedValue = options.defaultValue ?? false;
      } else {
        // Si no se permite, usamos false pero reportaremos error en la validación
        processedValue = false;
      }
    } else if (typeof value === 'boolean') {
      processedValue = value;
    } else if (options.convertValues) {
      // Convertimos valores no booleanos si está habilitada la opción
      processedValue = BooleanValueObject.convertToBoolean(value);
    } else {
      // Si no se permite convertir, usamos false pero reportaremos error en la validación
      processedValue = false;
    }

    // Llamamos al constructor de la clase base con el valor procesado
    super(processedValue, options.objectName);

    // Guardamos las opciones para usarlas en las validaciones
    this._options = {
      allowNull: options.allowNull ?? false,
      defaultValue: options.defaultValue,
      customValidator: options.customValidator,
      convertValues: options.convertValues ?? false,
      ...options,
    };
  }

  /**
   * Convierte diferentes tipos de valores a booleano
   * @param value - Valor a convertir
   * @returns Valor convertido a booleano
   */
  private static convertToBoolean(value: any): boolean {
    if (typeof value === 'string') {
      const lowercaseValue = value.toLowerCase().trim();
      return (
        lowercaseValue === 'true' ||
        lowercaseValue === '1' ||
        lowercaseValue === 'yes' ||
        lowercaseValue === 'si' ||
        lowercaseValue === 'sí'
      );
    }

    if (typeof value === 'number') {
      return value !== 0;
    }

    // Para cualquier otro tipo, usamos la conversión implícita de JavaScript
    return Boolean(value);
  }

  /**
   * Implementa las validaciones básicas para booleanos y
   * llama al método validateBoolean para validaciones adicionales.
   *
   * @param value - El booleano a validar
   * @protected
   */
  protected validate(value: boolean): void {
    // Validamos que sea un booleano verdadero
    if (typeof value !== 'boolean') {
      this.reportError('El valor debe ser un booleano', 'value', {
        providedType: typeof value,
      });
      return;
    }

    // Si el valor original era null/undefined y no se permite, reportamos error
    if (
      (this._originalValue === null || this._originalValue === undefined) &&
      !this._options.allowNull
    ) {
      this.reportError('El valor no puede ser nulo o indefinido', 'value');
    }

    // Si el valor original no era booleano y no se permite convertir, reportamos error
    if (
      typeof this._originalValue !== 'boolean' &&
      !this._options.convertValues
    ) {
      this.reportError('El valor debe ser un booleano', 'value', {
        providedType: typeof this._originalValue,
      });
    }

    // Ejecutar validador personalizado si se proporcionó
    if (this._options.customValidator) {
      const result = this._options.customValidator(value);
      if (!result.valid) {
        this.reportError(
          result.message ??
            'El valor no cumple con la validación personalizada',
          'value',
          { providedValue: value },
        );
      }
    }

    // Permite a las subclases implementar validaciones adicionales
    this.validateBoolean(value);
  }

  /**
   * Método para que las subclases implementen validaciones adicionales específicas.
   * Por defecto no hace nada, pero las subclases deben sobrescribirlo.
   *
   * @param value - El booleano a validar
   * @protected
   */
  protected abstract validateBoolean(value: boolean): void;

  /**
   * Almacena el valor original antes de procesar
   */
  private readonly _originalValue: any;

  /**
   * Obtiene el valor negado (inverso)
   * @returns El valor booleano invertido
   */
  public get not(): boolean {
    return !this.value;
  }

  /**
   * Compara con otro valor booleano
   * @param other - Otro valor booleano o BooleanValueObject para comparar
   * @returns true si los valores son iguales
   */
  public isEqualTo(other: boolean | BooleanValueObject): boolean {
    if (other instanceof BooleanValueObject) {
      return this.value === other.value;
    }
    return this.value === other;
  }
}
