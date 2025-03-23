import { DomainEvent } from '@common/domain-events/domain-event.abstract';
import type { User } from '../entities/user.entity';

/**
 * Evento que se dispara cuando se crea un usuario
 */
export class UserCreatedEvent extends DomainEvent {
  private readonly _user: User;

  constructor(user: User) {
    super('user.created');
    this._user = user;
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
