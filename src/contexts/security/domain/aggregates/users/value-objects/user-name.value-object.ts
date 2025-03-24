import { StringValueObject } from '@shared/domain/value-objects/string.value-object.abstract';

/**
 * Value Object que representa el nombre de un usuario
 */
export class UserName extends StringValueObject {
  /**
   * Patrón para validar nombres de usuario:
   * - Permite letras (mayúsculas y minúsculas)
   * - Permite espacios (para nombres compuestos)
   * - Permite apóstrofes y guiones (para nombres como O'Connor o García-Pérez)
   */
  private static readonly NAME_PATTERN = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s'-]+$/;

  /**
   * Patrón para detectar si un nombre comienza o termina con caracteres especiales
   */
  private static readonly SPECIAL_CHAR_BOUNDARY_PATTERN = /(^['-])|(['-]$)/;

  /**
   * Crea una nueva instancia de UserName
   * @param value - String que representa el nombre del usuario
   */
  constructor(value: string) {
    super(value, {
      objectName: 'UserName',
      minLength: 2,
      maxLength: 50,
      trim: true,
      allowEmpty: false,
      pattern: UserName.NAME_PATTERN,
      patternMessage:
        'El nombre solo puede contener letras, espacios, apóstrofes y guiones',
    });
  }

  /**
   * Validaciones adicionales específicas para el nombre de usuario
   * @param value - Valor a validar
   */
  protected validateString(value: string): void {
    // Verificamos que no contenga múltiples espacios consecutivos
    if (/\s\s+/.test(value)) {
      this.reportError(
        'El nombre no puede contener múltiples espacios consecutivos',
        'UserName',
      );
    }

    // Verificamos que no comience ni termine con caracteres especiales
    if (UserName.SPECIAL_CHAR_BOUNDARY_PATTERN.test(value)) {
      this.reportError(
        'El nombre no puede comenzar ni terminar con apóstrofes o guiones',
        'UserName',
      );
    }
  }

  /**
   * Formatea el nombre con la primera letra de cada palabra en mayúscula
   * @returns Nombre formateado
   */
  toFormattedName(): string {
    return this.value
      .split(' ')
      .map(word =>
        word.length > 0
          ? word[0].toUpperCase() + word.substring(1).toLowerCase()
          : '',
      )
      .join(' ');
  }
}
