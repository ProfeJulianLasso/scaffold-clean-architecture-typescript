import { DomainEvent } from '@shared/domain/event.abstract';
import type { User } from '../entities/user.entity';

/**
 * Evento que se dispara cuando se actualiza un usuario
 */
export class UserUpdatedEvent extends DomainEvent {
  constructor(private readonly _user: User) {
    super('user.updated');
  }

  get user(): User {
    return this._user;
  }

  toPlainObject(): object {
    return {
      eventId: this.eventId,
      occurredOn: this.occurredOn,
      eventName: this.eventName,
      user: this._user.toJSON(),
    };
  }
}
