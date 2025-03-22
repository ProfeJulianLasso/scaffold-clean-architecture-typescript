/* eslint-disable no-unused-vars */
import { ValueObject } from './value-object.abstract';

/**
 * Interfaz para configurar las validaciones del NumberValueObject
 */
export interface NumberValueObjectOptions {
  /** Nombre personalizado para el objeto */
  objectName?: string;
  /** Valor mínimo permitido (inclusive) */
  min?: number;
  /** Valor máximo permitido (inclusive) */
  max?: number;
  /** Si el número debe ser entero */
  integer?: boolean;
  /** Si se permiten valores negativos */
  allowNegative?: boolean;
  /** Si se permite el valor cero */
  allowZero?: boolean;
  /** Cantidad máxima de decimales permitidos */
  maxDecimals?: number;
  /** Función de validación personalizada */
  customValidator?: (value: number) => { valid: boolean; message?: string };
}

/**
 * Clase base abstracta para Value Objects de tipo number.
 * Proporciona validaciones comunes para valores numéricos.
 */
export abstract class NumberValueObject extends ValueObject<number> {
  private readonly options: NumberValueObjectOptions;

  /**
   * Crea una nueva instancia de NumberValueObject
   *
   * @param value - El número a encapsular
   * @param options - Opciones de configuración para las validaciones
   */
  constructor(value: number, options: NumberValueObjectOptions = {}) {
    // Llamamos al constructor de la clase base con el valor
    super(value, options.objectName);

    // Guardamos las opciones para usarlas en las validaciones
    this.options = {
      min: options.min,
      max: options.max,
      integer: options.integer ?? false,
      allowNegative: options.allowNegative ?? true,
      allowZero: options.allowZero ?? true,
      maxDecimals: options.maxDecimals,
      customValidator: options.customValidator,
      ...options,
    };
  }

  /**
   * Implementa las validaciones básicas para números y
   * llama al método validateNumber para validaciones adicionales.
   *
   * @param value - El número a validar
   * @protected
   */
  protected validate(value: number): void {
    // Comprobamos que sea un número válido (no NaN o Infinity)
    if (!Number.isFinite(value)) {
      this.reportError('El valor debe ser un número finito', 'value', {
        providedValue: value,
      });
      return;
    }

    // Validación de valor mínimo
    if (this.options.min !== undefined && value < this.options.min) {
      this.reportError(
        `El valor no puede ser menor que ${this.options.min}`,
        'value',
        { actualValue: value, min: this.options.min },
      );
    }

    // Validación de valor máximo
    if (this.options.max !== undefined && value > this.options.max) {
      this.reportError(
        `El valor no puede ser mayor que ${this.options.max}`,
        'value',
        { actualValue: value, max: this.options.max },
      );
    }

    // Validación de número entero
    if (this.options.integer && !Number.isInteger(value)) {
      this.reportError('El valor debe ser un número entero', 'value', {
        providedValue: value,
      });
    }

    // Validación de valores negativos
    if (!this.options.allowNegative && value < 0) {
      this.reportError('No se permiten valores negativos', 'value', {
        providedValue: value,
      });
    }

    // Validación de valor cero
    if (!this.options.allowZero && value === 0) {
      this.reportError('El valor no puede ser cero', 'value');
    }

    // Validación de decimales máximos
    if (this.options.maxDecimals !== undefined) {
      const decimalStr = value.toString().split('.')[1] || '';
      if (decimalStr.length > this.options.maxDecimals) {
        this.reportError(
          `El valor no puede tener más de ${this.options.maxDecimals} decimales`,
          'value',
          {
            providedValue: value,
            decimalsCount: decimalStr.length,
            maxDecimals: this.options.maxDecimals,
          },
        );
      }
    }

    // Ejecutar validador personalizado si se proporcionó
    if (this.options.customValidator) {
      const result = this.options.customValidator(value);
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
    this.validateNumber(value);
  }

  /**
   * Método para que las subclases implementen validaciones adicionales específicas.
   * Por defecto no hace nada, pero las subclases deben sobrescribirlo.
   *
   * @param value - El número a validar
   * @protected
   */
  protected abstract validateNumber(value: number): void;
}
