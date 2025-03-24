import type { Result } from '@common/utils/result-pattern/result.pattern';
import type { UserAggregate } from './user.aggregate';
import type { UserEmail } from './value-objects/user-email.value-object';
import type { UserId } from './value-objects/user-id.value-object';

/**
 * Interfaz para el repositorio de usuarios
 * Define las operaciones que deben ser implementadas por cualquier repositorio
 * que maneje usuarios en la capa de infraestructura
 */
export interface IUserRepository {
  /**
   * Guarda un usuario en el repositorio
   */
  save(user: UserAggregate): Promise<Result<UserAggregate>>;

  /**
   * Busca un usuario por su ID
   */
  findById(id: UserId): Promise<Result<UserAggregate | null>>;

  /**
   * Busca un usuario por su email
   */
  findByEmail(email: UserEmail): Promise<Result<UserAggregate | null>>;

  /**
   * Verifica si existe un usuario con el email proporcionado
   */
  existsByEmail(email: UserEmail): Promise<Result<boolean>>;
}
