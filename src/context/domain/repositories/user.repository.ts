import type { Result } from '@common/utils/result-pattern';
import type { UserAggregate } from '../aggregates/users/user.aggregate';
import type { UserEmail } from '../aggregates/users/value-objects/user-email.value-object';
import type { UserID } from '../aggregates/users/value-objects/user-id.value-object';

/**
 * Interfaz de repositorio para el agregado de Usuario
 * Definida en el dominio y utilizada por la capa de aplicación
 */
export interface IUserRepository {
  /**
   * Busca un usuario por su ID
   * @param id - ID del usuario
   * @returns Result con el agregado de usuario o null si no existe
   */
  findById(id: UserID): Promise<Result<UserAggregate | null>>;

  /**
   * Busca un usuario por su email
   * @param email - Email del usuario
   * @returns Result con el agregado de usuario o null si no existe
   */
  findByEmail(email: UserEmail): Promise<Result<UserAggregate | null>>;

  /**
   * Guarda un usuario nuevo o actualiza uno existente
   * @param user - Agregado de usuario a guardar
   * @returns Result con éxito o error
   */
  save(user: UserAggregate): Promise<Result<void>>;

  /**
   * Verifica si existe un usuario con el email proporcionado
   * @param email - Email a verificar
   * @returns Result con true si existe, false si no existe
   */
  exists(email: UserEmail): Promise<Result<boolean>>;
}
