import { UserEntity } from './entities/user.entity';
import { UserCreatedEvent } from './events/user-created.event';
import type { UserEmail } from './value-objects/user-email.value-object';
import type { UserId } from './value-objects/user-id.value-object';
import type { UserName } from './value-objects/user-name.value-object';
import type { UserPassword } from './value-objects/user-password.value-object';
import { UserStatus } from './value-objects/user-status.value-object';

/**
 * Agregado de usuario
 * Encapsula la lógica de negocio relacionada con usuarios
 */
export class UserAggregate extends UserEntity {
  /**
   * Factory method para crear un nuevo usuario
   */
  static create(
    id: UserId,
    name: UserName,
    email: UserEmail,
    password: UserPassword,
    status: UserStatus = new UserStatus(true),
  ): UserAggregate {
    const user = new UserAggregate(id, name, email, password, status);

    // Registrar evento de creación
    const createdEvent = new UserCreatedEvent(id, email);
    user.addDomainEvent(createdEvent);

    return user;
  }
}
