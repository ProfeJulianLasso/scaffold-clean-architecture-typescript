import { ValueObject } from './value-object.abstract';

/**
 * Interfaz para configurar las validaciones del StringValueObject
 */
export interface StringValueObjectOptions {
  /** Nombre personalizado para el objeto */
  objectName?: string;
  /** Longitud mínima permitida */
  minLength?: number;
  /** Longitud máxima permitida */
  maxLength?: number;
  /** Patrón de expresión regular que debe cumplir */
  pattern?: RegExp;
  /** Mensaje personalizado cuando no cumple con el patrón */
  patternMessage?: string;
  /** Si se permite que el string esté vacío (tras eliminar espacios) */
  allowEmpty?: boolean;
  /** Si se deben eliminar espacios al inicio y al final */
  trim?: boolean;
}

/**
 * Clase base abstracta para Value Objects de tipo string.
 * Proporciona validaciones comunes para valores de tipo string.
 */
export abstract class StringValueObject extends ValueObject<string> {
  private readonly options: StringValueObjectOptions;

  /**
   * Crea una nueva instancia de StringValueObject
   *
   * @param value - El string a encapsular
   * @param options - Opciones de configuración para las validaciones
   */
  constructor(value: string, options: StringValueObjectOptions = {}) {
    // Si la opción trim está habilitada, eliminamos espacios
    const processedValue =
      options.trim !== false && value ? value.trim() : value;

    // Llamamos al constructor de la clase base con el valor procesado
    super(processedValue, options.objectName);

    // Guardamos las opciones para usarlas en las validaciones
    this.options = {
      minLength: options.minLength,
      maxLength: options.maxLength,
      pattern: options.pattern,
      patternMessage: options.patternMessage,
      allowEmpty: options.allowEmpty ?? false,
      trim: options.trim !== false,
      ...options,
    };
  }

  /**
   * Implementa las validaciones básicas para strings y
   * llama al método validateString para validaciones adicionales.
   *
   * @param value - El string a validar
   * @protected
   */
  protected validate(value: string): void {
    // Validación de cadena vacía (solo si no se permite)
    if (!this.options.allowEmpty && value.length === 0) {
      this.reportError('El valor no puede estar vacío', 'value');
    }

    // Validación de longitud mínima
    if (
      this.options.minLength !== undefined &&
      value.length < this.options.minLength
    ) {
      this.reportError(
        `El valor debe tener al menos ${this.options.minLength} caracteres`,
        'value',
        { actualLength: value.length, minLength: this.options.minLength },
      );
    }

    // Validación de longitud máxima
    if (
      this.options.maxLength !== undefined &&
      value.length > this.options.maxLength
    ) {
      this.reportError(
        `El valor no puede exceder los ${this.options.maxLength} caracteres`,
        'value',
        { actualLength: value.length, maxLength: this.options.maxLength },
      );
    }

    // Validación de patrón si se especificó
    if (this.options.pattern && !this.options.pattern.test(value)) {
      const message =
        this.options.patternMessage ??
        'El valor no cumple con el formato requerido';

      this.reportError(message, 'value', {
        pattern: this.options.pattern.toString(),
      });
    }

    // Permite a las subclases implementar validaciones adicionales
    this.validateString(value);
  }

  /**
   * Método para que las subclases implementen validaciones adicionales específicas.
   * Por defecto no hace nada, pero las subclases pueden sobrescribirlo.
   *
   * @param value - El string a validar
   * @protected
   */
  protected abstract validateString(value: string): void;
}
