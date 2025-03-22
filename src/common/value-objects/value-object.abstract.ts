/* eslint-disable no-unused-vars */
import { ValidationHandler } from '@common/validation';

/**
 * Clase base abstracta para implementar Value Objects.
 *
 * Los Value Objects son objetos inmutables que representan un concepto dentro del dominio.
 * Se identifican por su valor, no por su identidad. Dos Value Objects con los
 * mismos valores se consideran iguales.
 *
 * @template ValueType Tipo del valor encapsulado por el Value Object
 */
export abstract class ValueObject<ValueType> extends ValidationHandler {
  private readonly _value: ValueType;
  private readonly _objectName: string;

  /**
   * Crea una nueva instancia de Value Object
   *
   * @param value - El valor a encapsular
   * @param objectName - Nombre personalizado para el objeto (opcional)
   * @throws {ResultException} Si el valor es null o undefined, o si no pasa la validación
   */
  constructor(value: ValueType, objectName?: string) {
    super(); // Inicializa el ValidationHandler

    // Establece el nombre del objeto (usa el nombre de la clase si no se proporciona)
    this._objectName = objectName ?? this.constructor.name;

    // Validación básica para valores nulos
    if (value === null || value === undefined) {
      this.reportError('El valor no puede ser null o undefined', 'value');
      this.throwIfHasErrors(this._objectName);
      return; // Esta línea nunca se ejecutará si hay errores, pero TypeScript lo necesita
    }

    // Ejecuta las validaciones específicas de la subclase
    this.validate(value);

    // Si hay errores de validación, lánzalos inmediatamente
    this.throwIfHasErrors(this._objectName);

    // Si pasó todas las validaciones, asignamos el valor
    this._value = value;
  }

  /**
   * Método de validación que las subclases deben implementar para
   * sus reglas de validación específicas. Utiliza los métodos heredados
   * de ValidationHandler para reportar errores.
   *
   * @param value - El valor a validar
   * @protected
   * @abstract
   */
  protected abstract validate(value: ValueType): void;

  /**
   * Obtiene el valor encapsulado
   */
  get value(): ValueType {
    return this._value;
  }

  /**
   * Obtiene el nombre definido para este value object
   */
  get objectName(): string {
    return this._objectName;
  }

  /**
   * Compara este Value Object con otro para determinar igualdad.
   *
   * @param other - El otro Value Object para comparar
   * @returns true si ambos Value Objects son iguales, false de lo contrario
   */
  equals(other: ValueObject<ValueType>): boolean {
    if (other === null || other === undefined) {
      return false;
    }

    if (!(other instanceof ValueObject)) {
      return false;
    }

    return this.isEqual(other.value);
  }

  /**
   * Método protegido que implementa la lógica de comparación específica.
   * Las subclases pueden sobrescribirlo para proporcionar comparaciones personalizadas.
   *
   * @param value - El valor a comparar con el valor actual
   * @returns true si los valores son iguales, false de lo contrario
   * @protected
   */
  protected isEqual(value: ValueType): boolean {
    // Para tipos primitivos, una comparación estricta es suficiente
    if (this.isPrimitive(this.value) && this.isPrimitive(value)) {
      return this.value === value;
    }

    // Para objetos y arrays, comparamos su estructura
    return JSON.stringify(this.value) === JSON.stringify(value);
  }

  /**
   * Determina si un valor es de tipo primitivo.
   *
   * @param value - El valor a verificar
   * @returns true si el valor es de tipo primitivo, false de lo contrario
   * @private
   */
  private isPrimitive(value: unknown): boolean {
    return (
      value === null ||
      value === undefined ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      typeof value === 'symbol' ||
      typeof value === 'bigint'
    );
  }

  /**
   * Convierte el Value Object a una representación de string.
   *
   * @returns Representación en string del valor
   */
  toString(): string {
    if (typeof this.value === 'object' && this.value !== null) {
      return JSON.stringify(this.value);
    }
    return String(this.value);
  }

  /**
   * Prepara el Value Object para serialización JSON.
   *
   * @returns El valor en un formato adecuado para JSON
   */
  toJSON(): unknown {
    return this.value;
  }

  /**
   * Verifica la validez del value object y lanza una excepción si no es válido
   *
   * @throws {ResultException} Si el value object no es válido
   */
  public ensureValid(): void {
    this.throwIfHasErrors(this._objectName);
  }
}
