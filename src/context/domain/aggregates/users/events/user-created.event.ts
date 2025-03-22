import { DomainEvent } from '@common/domain-events/domain-event.abstract';
import { User } from '../entities/user.entity';

/**
 * Evento que se dispara cuando se crea un usuario
 */
export class UserCreatedEvent extends DomainEvent {
  private readonly _user: User;

  constructor(user: User) {
    super('user.created');
    this._user = user;
  }

  public get user(): User {
    return this._user;
  }

  public toPlainObject(): object {
    return {
      eventId: this.eventId,
      occurredOn: this.occurredOn,
      eventName: this.eventName,
      user: this._user.toJSON(),
    };
  }
}
