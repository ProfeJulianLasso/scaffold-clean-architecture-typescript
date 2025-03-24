import {
  StringValueObject,
  type StringValueObjectOptions,
} from '@shared/domain/value-objects/string.value-object.abstract';

/**
 * Objeto de valor para el nombre de un usuario
 */
export class UserName extends StringValueObject {
  private static readonly MAX_LENGTH = 500;

  constructor(value: string) {
    const options: StringValueObjectOptions = {
      objectName: 'UserName',
      maxLength: UserName.MAX_LENGTH,
      allowEmpty: false,
      trim: true,
    };

    super(value, options);
  }

  protected validateString(value: string): void {
    // No se requieren validaciones adicionales más allá de las proporcionadas por las opciones
  }
}
