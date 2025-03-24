import {
  StringValueObject,
  type StringValueObjectOptions,
} from '@shared/domain/value-objects/string.value-object.abstract';

/**
 * Objeto de valor para la contraseña de un usuario
 */
export class UserPassword extends StringValueObject {
  private static readonly MIN_LENGTH = 8;

  constructor(value: string) {
    const options: StringValueObjectOptions = {
      objectName: 'UserPassword',
      minLength: UserPassword.MIN_LENGTH,
      allowEmpty: false,
      trim: false,
    };

    super(value, options);
  }

  protected validateString(value: string): void {
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumbers = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value);

    if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
      this.reportError(
        'La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial',
        'UserPassword',
      );
    }
  }
}
