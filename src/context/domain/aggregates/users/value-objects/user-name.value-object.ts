import { StringValueObject } from '@common/value-objects';

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
        'value',
      );
    }

    // Verificamos que no comience ni termine con caracteres especiales
    if (/^['-]|['-]$/.test(value)) {
      this.reportError(
        'El nombre no puede comenzar ni terminar con apóstrofes o guiones',
        'value',
      );
    }
  }

  /**
   * Formatea el nombre con la primera letra de cada palabra en mayúscula
   * @returns Nombre formateado
   */
  public toFormattedName(): string {
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
