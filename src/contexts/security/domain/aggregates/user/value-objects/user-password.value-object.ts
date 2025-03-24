import {
  StringValueObject,
  type StringValueObjectOptions,
} from '@shared/domain/value-objects/string.value-object.abstract';

/**
 * Objeto de valor para la contraseña de un usuario
 */
export class UserPassword extends StringValueObject {
  private static readonly MIN_LENGTH = 8;
  private readonly _isHashed: boolean;

  /**
   * Constructor para una contraseña
   * @param value Contraseña en texto plano o hashed
   * @param isHashed Indica si la contraseña ya está hasheada
   */
  constructor(value: string, isHashed = false) {
    const options: StringValueObjectOptions = {
      objectName: 'UserPassword',
      // Solo validamos longitud mínima si no está hasheada
      minLength: isHashed ? undefined : UserPassword.MIN_LENGTH,
      allowEmpty: false,
      trim: false,
    };

    super(value, options);
    this._isHashed = isHashed;
  }

  protected validateString(value: string): void {
    // Solo aplicamos validaciones de seguridad si no está hasheada
    if (!this._isHashed) {
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumbers = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value);

      if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
        this.reportError(
          'La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial',
          'value',
        );
      }
    }
  }

  /**
   * Indica si la contraseña está hasheada
   */
  get isHashed(): boolean {
    return this._isHashed;
  }

  /**
   * Método factory para crear una contraseña desde un valor hasheado
   */
  static fromHashed(hashedValue: string): UserPassword {
    return new UserPassword(hashedValue, true);
  }

  /**
   * Interfaz para crear un hash de la contraseña
   * Esta función es utilizada por la capa de infraestructura para hashear la contraseña
   * @param hashFunction Función externa que realiza el hasheo real
   * @returns Una nueva instancia de UserPassword con el valor hasheado
   */
  async hash(
    hashFunction: (plaintext: string) => Promise<string>,
  ): Promise<UserPassword> {
    if (this._isHashed) {
      return this; // Si ya está hasheada, retornamos la misma instancia
    }

    const hashedValue = await hashFunction(this.value);
    return UserPassword.fromHashed(hashedValue);
  }

  /**
   * Método para comparar una contraseña en texto plano con una hasheada
   * Esta función es utilizada por la capa de infraestructura para verificar contraseñas
   * @param plainPassword Contraseña en texto plano a comparar
   * @param compareFunction Función externa que realiza la comparación
   * @returns Promesa que resuelve a true si la contraseña coincide, false en caso contrario
   */
  async compare(
    plainPassword: string,
    compareFunction: (plaintext: string, hash: string) => Promise<boolean>,
  ): Promise<boolean> {
    if (!this._isHashed) {
      return this.value === plainPassword; // Comparación directa si ambas están en texto plano
    }

    return compareFunction(plainPassword, this.value);
  }
}
