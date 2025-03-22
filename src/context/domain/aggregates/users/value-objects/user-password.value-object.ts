/* eslint-disable no-useless-escape */
import { StringValueObject } from '@common/value-objects';
import * as bcrypt from 'bcrypt';

/**
 * Opciones para la creación de una contraseña
 */
export interface UserPasswordOptions {
  /** Indica si el valor proporcionado ya está hasheado */
  isHashed?: boolean;
  /** Rondas de sal para bcrypt (por defecto 10) */
  saltRounds?: number;
}

/**
 * Value Object que representa la contraseña de un usuario
 */
export class UserPassword extends StringValueObject {
  /**
   * Patrones para validar los requisitos de seguridad
   */
  private static readonly UPPERCASE_PATTERN = /[A-Z]/;
  private static readonly LOWERCASE_PATTERN = /[a-z]/;
  private static readonly NUMBER_PATTERN = /[0-9]/;
  private static readonly SPECIAL_CHAR_PATTERN =
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

  /**
   * Indica si la contraseña proporcionada ya estaba hasheada
   */
  private readonly isHashed: boolean;

  /**
   * Rondas de sal para bcrypt
   */
  private readonly saltRounds: number;

  /**
   * Crea una nueva instancia de UserPassword
   * @param value - String que representa la contraseña
   * @param options - Opciones para el manejo de la contraseña
   */
  constructor(value: string, options: UserPasswordOptions = {}) {
    super(value, {
      objectName: 'UserPassword',
      minLength: options.isHashed ? 60 : 8, // bcrypt genera hashes de ~60 caracteres
      maxLength: 100,
      trim: true,
      allowEmpty: false,
    });

    this.isHashed = options.isHashed ?? false;
    this.saltRounds = options.saltRounds ?? 10;
  }

  /**
   * Validaciones adicionales específicas para la contraseña
   * @param value - Valor a validar
   */
  protected validateString(value: string): void {
    // Si ya está hasheada, no validamos los requisitos de seguridad
    if (this.isHashed) {
      // Verificamos que parezca un hash de bcrypt (comienza con $2b$)
      if (!value.startsWith('$2b$')) {
        this.reportError(
          'El hash de la contraseña no tiene el formato esperado',
          'value',
        );
      }
      return;
    }

    // Validaciones de requisitos de seguridad para contraseña en texto plano
    if (/\s/.test(value)) {
      this.reportError('La contraseña no puede contener espacios', 'value');
    }

    if (!UserPassword.UPPERCASE_PATTERN.test(value)) {
      this.reportError(
        'La contraseña debe contener al menos una letra mayúscula',
        'value',
      );
    }

    if (!UserPassword.LOWERCASE_PATTERN.test(value)) {
      this.reportError(
        'La contraseña debe contener al menos una letra minúscula',
        'value',
      );
    }

    if (!UserPassword.NUMBER_PATTERN.test(value)) {
      this.reportError(
        'La contraseña debe contener al menos un número',
        'value',
      );
    }

    if (!UserPassword.SPECIAL_CHAR_PATTERN.test(value)) {
      this.reportError(
        'La contraseña debe contener al menos un carácter especial',
        'value',
      );
    }
  }

  /**
   * Hash de la contraseña usando bcrypt
   * @returns Promise con el hash de la contraseña
   */
  public async hash(): Promise<UserPassword> {
    // Si ya está hasheada, devolvemos la misma instancia
    if (this.isHashed) {
      return this;
    }

    // Hacemos hash de la contraseña
    const hashedPassword = await bcrypt.hash(this.value, this.saltRounds);

    // Creamos una nueva instancia con el hash y la marcamos como hasheada
    return new UserPassword(hashedPassword, { isHashed: true });
  }

  /**
   * Verifica si la contraseña en texto plano coincide con esta contraseña (hash)
   * @param plainTextPassword - Contraseña en texto plano a verificar
   * @returns Promise<boolean> - true si coincide, false en caso contrario
   */
  public async compare(plainTextPassword: string): Promise<boolean> {
    // Si esta instancia no está hasheada, no podemos comparar
    if (!this.isHashed) {
      throw new Error(
        'No se puede comparar con una contraseña que no está hasheada',
      );
    }

    // Comparamos la contraseña en texto plano con el hash
    return bcrypt.compare(plainTextPassword, this.value);
  }

  /**
   * Sobreescribimos toJSON para nunca exponer la contraseña
   * @returns Un objeto que oculta la contraseña
   */
  public toJSON(): object {
    return {
      isHashed: this.isHashed,
      // No incluimos el valor de la contraseña
    };
  }

  /**
   * Sobreescribimos toString para nunca exponer la contraseña
   * @returns Un string que indica que es una contraseña protegida
   */
  public toString(): string {
    return '[PROTECTED PASSWORD]';
  }
}
