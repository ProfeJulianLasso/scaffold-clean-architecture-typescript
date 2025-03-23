import { ErrorType } from '@common/exceptions';
import { Result } from '@common/utils/result-pattern';
import type { User } from '../aggregates/users/entities/user.entity';

/**
 * Política de dominio para la activación y desactivación de usuarios
 *
 * Define las reglas de negocio que deben cumplirse para gestionar
 * los estados de activación de los usuarios en el sistema.
 * @module UserActivationPolicy
 */
export const userActivationPolicy = {
  /**
   * Verifica si un usuario puede ser activado
   * @param user - Usuario a activar
   * @returns Result con éxito o error
   */
  canActivate(user: User): Result<void> {
    // Un usuario ya activo no puede ser activado nuevamente
    if (user.isActive) {
      return Result.fail(
        ErrorType.DOMAIN,
        'No se puede activar un usuario que ya está activo',
        {
          code: 'USER_ALREADY_ACTIVE',
          source: 'domain.policy.user-activation',
        },
      );
    }

    return Result.success();
  },

  /**
   * Verifica si un usuario puede ser desactivado
   * @param user - Usuario a desactivar
   * @returns Result con éxito o error
   */
  canDeactivate(user: User): Result<void> {
    // Un usuario ya inactivo no puede ser desactivado nuevamente
    if (!user.isActive) {
      return Result.fail(
        ErrorType.DOMAIN,
        'No se puede desactivar un usuario que ya está inactivo',
        {
          code: 'USER_ALREADY_INACTIVE',
          source: 'domain.policy.user-activation',
        },
      );
    }

    return Result.success();
  },
};
