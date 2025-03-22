/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { UUIDv7 } from '@common/utils/uuid-v7';
import { ValueObject } from './value-object.abstract';

/**
 * Opciones para configurar el IDValueObject
 */
export interface IDValueObjectOptions {
  /** Nombre personalizado para el objeto */
  objectName?: string;
  /** Si se debe generar automáticamente un ID cuando no se proporcione uno */
  autoGenerate?: boolean;
}

/**
 * Clase base abstracta para Value Objects de tipo ID.
 * Trabaja con identificadores basados en UUIDv7.
 */
export abstract class IDValueObject extends ValueObject<string> {
  private readonly _uuid: UUIDv7;

  /**
   * Crea una nueva instancia de IDValueObject
   *
   * @param value - El ID en formato string (opcional si autoGenerate es true)
   * @param options - Opciones de configuración
   */
  constructor(value?: string, options: IDValueObjectOptions = {}) {
    // Si no se proporciona un ID y autoGenerate está habilitado (por defecto), generamos uno nuevo
    const autoGenerate = options.autoGenerate !== false;
    let uuid: UUIDv7 | undefined;
    let finalValue: string;

    if (!value && autoGenerate) {
      // Generamos un nuevo UUIDv7 si no se proporciona valor
      uuid = UUIDv7.generate();
      finalValue = uuid.toString();
    } else if (value) {
      // Si se proporciona valor, intentamos parsearlo como UUIDv7
      try {
        uuid = UUIDv7.parse(value);
        finalValue = value;
      } catch (error: unknown) {
        // No hacemos nada aquí, la validación reportará el error posteriormente
        finalValue = value;
      }
    } else {
      // Si llegamos aquí es porque value es undefined/null y autoGenerate es false
      finalValue = '';
    }

    // Llamamos al constructor de la clase base con el valor procesado
    super(finalValue, options.objectName);

    // Guardamos la instancia de UUIDv7 para acceso posterior
    if (uuid) {
      this._uuid = uuid;
    } else {
      // Si no hay UUID válido, lanzamos un error
      this.reportError(
        'El ID no es válido. Debe ser un UUIDv7 o autoGenerate debe ser true',
        'value',
      );
      this.throwIfHasErrors(this.constructor.name);
    }
  }

  /**
   * Implementa las validaciones para el ID
   *
   * @param value - El ID a validar
   * @protected
   */
  protected validate(value: string): void {
    if (!value) {
      this.reportError('El ID no puede estar vacío', 'value');
      return;
    }

    if (!UUIDv7.isValid(value)) {
      this.reportError(
        'El formato del ID no es válido. Debe ser un UUIDv7',
        'value',
      );
      return;
    }

    // Permite a las subclases implementar validaciones adicionales
    this.validateID(value);
  }

  /**
   * Método para que las subclases implementen validaciones adicionales específicas.
   * Por defecto no hace nada, pero las subclases pueden sobrescribirlo.
   *
   * @param value - El ID a validar
   * @protected
   */
  protected abstract validateID(value: string): void;

  /**
   * Obtiene el objeto UUIDv7 subyacente
   * @returns Instancia de UUIDv7
   */
  public get uuid(): UUIDv7 {
    return this._uuid;
  }

  /**
   * Obtiene el timestamp del ID
   * @returns Timestamp en milisegundos
   */
  public getTimestamp(): number {
    return this._uuid.getTimestamp();
  }

  /**
   * Obtiene la fecha de creación del ID
   * @returns Fecha de creación
   */
  public getDate(): Date {
    return this._uuid.getDate();
  }

  /**
   * Compara este ID con otro para ordenación
   * @param other - Otro ID para comparar
   * @returns Número negativo si este ID es menor, positivo si es mayor, 0 si son iguales
   */
  public compareTo(other: IDValueObject): number {
    return this._uuid.compareTo(other.uuid);
  }
}
