import { ErrorType } from '@common/exceptions';
import { Result } from '@common/utils/result-pattern';
import { UserPassword } from '../aggregates/users/value-objects/user-password.value-object';

/**
 * Política de dominio para las contraseñas
 * Define reglas de negocio relacionadas con contraseñas
 */
export class PasswordPolicy {
  // Patrones para validar los requisitos de seguridad
  private static readonly UPPERCASE_PATTERN = /[A-Z]/;
  private static readonly LOWERCASE_PATTERN = /[a-z]/;
  private static readonly NUMBER_PATTERN = /[0-9]/;
  private static readonly SPECIAL_CHAR_PATTERN =
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/;

  /**
   * Valida los requisitos de seguridad de una contraseña
   * @param password - Contraseña en texto plano
   * @returns Result con éxito o error
   */
  public static validateSecurity(password: string): Result<void> {
    // Verificar espacios
    if (/\s/.test(password)) {
      return Result.fail(
        ErrorType.DOMAIN,
        'La contraseña no puede contener espacios',
        {
          code: 'PASSWORD_CONTAINS_SPACES',
          source: 'domain.policy.password',
        },
      );
    }

    // Verificar mayúsculas
    if (!this.UPPERCASE_PATTERN.test(password)) {
      return Result.fail(
        ErrorType.DOMAIN,
        'La contraseña debe contener al menos una letra mayúscula',
        {
          code: 'PASSWORD_MISSING_UPPERCASE',
          source: 'domain.policy.password',
        },
      );
    }

    // Verificar minúsculas
    if (!this.LOWERCASE_PATTERN.test(password)) {
      return Result.fail(
        ErrorType.DOMAIN,
        'La contraseña debe contener al menos una letra minúscula',
        {
          code: 'PASSWORD_MISSING_LOWERCASE',
          source: 'domain.policy.password',
        },
      );
    }

    // Verificar números
    if (!this.NUMBER_PATTERN.test(password)) {
      return Result.fail(
        ErrorType.DOMAIN,
        'La contraseña debe contener al menos un número',
        {
          code: 'PASSWORD_MISSING_NUMBER',
          source: 'domain.policy.password',
        },
      );
    }

    // Verificar caracteres especiales
    if (!this.SPECIAL_CHAR_PATTERN.test(password)) {
      return Result.fail(
        ErrorType.DOMAIN,
        'La contraseña debe contener al menos un carácter especial',
        {
          code: 'PASSWORD_MISSING_SPECIAL_CHAR',
          source: 'domain.policy.password',
        },
      );
    }

    return Result.success();
  }

  /**
   * Verifica si se puede cambiar una contraseña
   * @param currentPassword - Contraseña actual (hash)
   * @param plainTextCurrentPassword - Contraseña actual en texto plano
   * @param newPassword - Nueva contraseña (ValueObject)
   * @returns Result con éxito o error
   */
  public static async canChangePassword(
    currentPassword: UserPassword,
    plainTextCurrentPassword: string,
    newPassword: UserPassword,
  ): Promise<Result<void>> {
    // Verificar que la contraseña actual sea correcta
    const isValid = await currentPassword.compare(plainTextCurrentPassword);
    if (!isValid) {
      return Result.fail(
        ErrorType.DOMAIN,
        'La contraseña actual es incorrecta',
        {
          code: 'CURRENT_PASSWORD_INVALID',
          source: 'domain.policy.password',
        },
      );
    }

    // Verificar que la nueva contraseña sea diferente
    if (plainTextCurrentPassword === newPassword.value) {
      return Result.fail(
        ErrorType.DOMAIN,
        'La nueva contraseña debe ser diferente a la actual',
        {
          code: 'NEW_PASSWORD_SAME_AS_CURRENT',
          source: 'domain.policy.password',
        },
      );
    }

    return Result.success();
  }
}
