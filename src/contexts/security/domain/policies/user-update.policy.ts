import { ErrorType } from '@common/exceptions/result.exception';
import { Result } from '@common/utils/result-pattern/result.pattern';
import type { User } from '../aggregates/users/entities/user.entity';
import type { UserEmail } from '../aggregates/users/value-objects/user-email.value-object';
import type { UserName } from '../aggregates/users/value-objects/user-name.value-object';

/**
 * Política de dominio para actualización de usuarios
 *
 * Define las reglas de negocio que deben cumplirse para poder
 * actualizar la información de los usuarios en el sistema.
 * @module UserUpdatePolicy
 */
export const userUpdatePolicy = {
  /**
   * Verifica si se puede cambiar el nombre de un usuario
   * @param user - Usuario a modificar
   * @param newName - Nuevo nombre
   * @returns Result con éxito o error
   */
  canChangeName(user: User, newName: UserName): Result<void> {
    // Verificar que el usuario esté activo
    if (!user.isActive) {
      return Result.fail(
        ErrorType.DOMAIN,
        'No se puede cambiar el nombre de un usuario inactivo',
        {
          code: 'INACTIVE_USER_UPDATE',
          source: 'domain.policy.user-update',
        },
      );
    }

    // Verificar que el nombre sea diferente al actual
    if (user.name.value === newName.value) {
      return Result.fail(
        ErrorType.DOMAIN,
        'El nuevo nombre debe ser diferente al actual',
        {
          code: 'SAME_NAME_UPDATE',
          source: 'domain.policy.user-update',
        },
      );
    }

    return Result.success();
  },

  /**
   * Verifica si se puede cambiar el email de un usuario
   * @param user - Usuario a modificar
   * @param newEmail - Nuevo email
   * @returns Result con éxito o error
   */
  canChangeEmail(user: User, newEmail: UserEmail): Result<void> {
    // Verificar que el usuario esté activo
    if (!user.isActive) {
      return Result.fail(
        ErrorType.DOMAIN,
        'No se puede cambiar el email de un usuario inactivo',
        {
          code: 'INACTIVE_USER_UPDATE',
          source: 'domain.policy.user-update',
        },
      );
    }

    // Verificar que el email sea diferente al actual
    if (user.email.value === newEmail.value) {
      return Result.fail(
        ErrorType.DOMAIN,
        'El nuevo email debe ser diferente al actual',
        {
          code: 'SAME_EMAIL_UPDATE',
          source: 'domain.policy.user-update',
        },
      );
    }

    return Result.success();
  },
};
