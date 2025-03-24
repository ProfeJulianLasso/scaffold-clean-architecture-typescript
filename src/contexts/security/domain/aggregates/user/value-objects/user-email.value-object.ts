import {
  StringValueObject,
  type StringValueObjectOptions,
} from '@shared/domain/value-objects/string.value-object.abstract';

/**
 * Objeto de valor para el email de un usuario
 */
export class UserEmail extends StringValueObject {
  private static readonly MAX_LENGTH = 500;
  private static readonly EMAIL_PATTERN =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  constructor(value: string) {
    const options: StringValueObjectOptions = {
      objectName: 'UserEmail',
      maxLength: UserEmail.MAX_LENGTH,
      allowEmpty: false,
      trim: true,
      pattern: UserEmail.EMAIL_PATTERN,
      patternMessage: 'El formato del email no es válido',
    };

    super(value, options);
  }

  protected validateString(value: string): void {
    // No se requieren validaciones adicionales más allá de las proporcionadas por las opciones
  }
}
