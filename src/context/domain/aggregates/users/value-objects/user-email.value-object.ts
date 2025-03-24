import { StringValueObject } from '@common/value-objects/string.value-object.abstract';

/**
 * Value Object que representa el correo electrónico de un usuario
 */
export class UserEmail extends StringValueObject {
  /**
   * Patrón para validar correos electrónicos:
   * - Valida el formato básico de un correo electrónico
   * - Requiere: nombre@dominio.extensión
   * - Permite caracteres especiales como punto, guion, guion bajo en la parte local
   * - Permite subdominios
   */
  private static readonly EMAIL_PATTERN =
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

  /**
   * Crea una nueva instancia de UserEmail
   * @param value - String que representa el correo electrónico del usuario
   */
  constructor(value: string) {
    super(value, {
      objectName: 'UserEmail',
      minLength: 5, // a@b.c (mínimo teórico de un email)
      maxLength: 200, // Longitud máxima según estándares
      trim: true,
      allowEmpty: false,
      pattern: UserEmail.EMAIL_PATTERN,
      patternMessage: 'El formato del correo electrónico no es válido',
    });
  }

  /**
   * Validaciones adicionales específicas para el correo electrónico
   * @param value - Valor a validar
   */
  protected validateString(value: string): void {
    // Verificamos que el dominio tenga al menos un punto
    if (!value.includes('@') || !value.split('@')[1].includes('.')) {
      this.reportError(
        'El dominio del correo electrónico no es válido',
        'value',
      );
    }
  }

  /**
   * Devuelve la parte local del correo electrónico (antes del @)
   * @returns Parte local del correo
   */
  getLocalPart(): string {
    return this.value.split('@')[0];
  }

  /**
   * Devuelve el dominio del correo electrónico (después del @)
   * @returns Dominio del correo
   */
  getDomain(): string {
    const parts = this.value.split('@');
    return parts.length > 1 ? parts[1] : '';
  }

  /**
   * Normaliza el correo electrónico a minúsculas
   * @returns Correo normalizado
   */
  normalize(): string {
    return this.value.toLowerCase();
  }
}
