import {
  ErrorType,
  ResultException,
} from '@common/exceptions/result.exception';
import { StringValueObject } from '@shared/domain/value-objects/string.value-object.abstract';
import * as bcrypt from 'bcrypt';
import { passwordPolicy } from 'src/contexts/security/domain/policies/password.policy';

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
    // Si ya está hasheada, solo validamos el formato del hash
    if (this.isHashed) {
      // Verificamos que parezca un hash de bcrypt (comienza con $2b$)
      if (!value.startsWith('$2b$')) {
        this.reportError(
          'El hash de la contraseña no tiene el formato esperado',
          'UserPassword',
        );
      }
      return;
    }

    // Si no está hasheada, aplicamos la política de seguridad
    const securityResult = passwordPolicy.validateSecurity(value);

    if (securityResult.isFailure()) {
      this.reportError(securityResult.getError().message, 'UserPassword', {
        policyError: securityResult.getError().details,
      });
    }
  }

  /**
   * Hash de la contraseña usando bcrypt
   * @returns Promise con el hash de la contraseña
   */
  async hash(): Promise<UserPassword> {
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
  async compare(plainTextPassword: string): Promise<boolean> {
    // Si esta instancia no está hasheada, no podemos comparar
    if (!this.isHashed) {
      throw new ResultException(
        ErrorType.DOMAIN,
        'No se puede comparar con una contraseña que no está hasheada',
        {
          code: 'PASSWORD_NOT_HASHED',
          source: 'UserPassword.compare',
          statusCode: 400,
          isOperational: true,
          metadata: {
            password: this.value,
            plainTextPassword,
          },
          stack: new Error().stack,
        },
      );
    }

    // Comparamos la contraseña en texto plano con el hash
    return bcrypt.compare(plainTextPassword, this.value);
  }

  /**
   * Sobreescribimos toJSON para nunca exponer la contraseña
   * @returns Un objeto que oculta la contraseña
   */
  toJSON(): object {
    return {
      isHashed: this.isHashed,
      // No incluimos el valor de la contraseña
    };
  }

  /**
   * Sobreescribimos toString para nunca exponer la contraseña
   * @returns Un string que indica que es una contraseña protegida
   */
  toString(): string {
    return '[PROTECTED PASSWORD]';
  }
}
