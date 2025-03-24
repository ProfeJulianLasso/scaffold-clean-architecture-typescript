import { DomainEvent } from '@shared/domain/event.abstract';
import type { UserEmail } from '../value-objects/user-email.value-object';
import type { UserId } from '../value-objects/user-id.value-object';

/**
 * Evento de dominio que representa la creación de un usuario
 */
export class UserCreatedEvent extends DomainEvent {
  private readonly _userId: UserId;
  private readonly _email: UserEmail;

  constructor(userId: UserId, email: UserEmail) {
    super('user.created');
    this._userId = userId;
    this._email = email;
  }

  get userId(): UserId {
    return this._userId;
  }

  get email(): UserEmail {
    return this._email;
  }

  toPlainObject(): Record<string, unknown> {
    return {
      eventId: this.eventId,
      eventName: this.eventName,
      occurredOn: this.occurredOn,
      userId: this._userId.value,
      email: this._email.value,
    };
  }
}
