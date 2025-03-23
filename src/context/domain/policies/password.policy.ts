import { ErrorType } from '@common/exceptions';
import { Result } from '@common/utils/result-pattern';
import type { UserPassword } from '../aggregates/users/value-objects/user-password.value-object';

// Patrones para validar los requisitos de seguridad
const UPPERCASE_PATTERN = /[A-Z]/;
const LOWERCASE_PATTERN = /[a-z]/;
const NUMBER_PATTERN = /[0-9]/;
const SPECIAL_CHAR_PATTERN = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/;

/**
 * Política de dominio para las contraseñas
 *
 * Define reglas de negocio relacionadas con la seguridad y
 * gestión de contraseñas de usuarios en el sistema.
 * @module PasswordPolicy
 */
export const passwordPolicy = {
  /**
   * Valida los requisitos de seguridad de una contraseña
   * @param password - Contraseña en texto plano
   * @returns Result con éxito o error
   */
  validateSecurity(password: string): Result<void> {
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
    if (!UPPERCASE_PATTERN.test(password)) {
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
    if (!LOWERCASE_PATTERN.test(password)) {
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
    if (!NUMBER_PATTERN.test(password)) {
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
    if (!SPECIAL_CHAR_PATTERN.test(password)) {
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
  },

  /**
   * Verifica si se puede cambiar una contraseña
   * @param currentPassword - Contraseña actual (hash)
   * @param plainTextCurrentPassword - Contraseña actual en texto plano
   * @param newPassword - Nueva contraseña (ValueObject)
   * @returns Result con éxito o error
   */
  async canChangePassword(
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
  },
};
