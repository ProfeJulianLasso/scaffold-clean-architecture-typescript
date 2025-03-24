import { Entity } from '@shared/domain/entity.abstract';
import type { UserEmail } from '../value-objects/user-email.value-object';
import type { UserId } from '../value-objects/user-id.value-object';
import type { UserName } from '../value-objects/user-name.value-object';
import type { UserPassword } from '../value-objects/user-password.value-object';
import type { UserStatus } from '../value-objects/user-status.value-object';

/**
 * Entidad de usuario
 */
export class UserEntity extends Entity<UserId> {
  private readonly _name: UserName;
  private readonly _email: UserEmail;
  private readonly _password: UserPassword;
  private readonly _status: UserStatus;

  constructor(
    id: UserId,
    name: UserName,
    email: UserEmail,
    password: UserPassword,
    status: UserStatus,
  ) {
    super(id);
    this._name = name;
    this._email = email;
    this._password = password;
    this._status = status;
  }

  get name(): UserName {
    return this._name;
  }

  get email(): UserEmail {
    return this._email;
  }

  get password(): UserPassword {
    return this._password;
  }

  get status(): UserStatus {
    return this._status;
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id.value,
      name: this._name.value,
      email: this._email.value,
      status: this._status.value,
      // No incluimos la contraseña por seguridad
    };
  }
}
