import type { Result } from '@common/utils/result-pattern';
import { AggregateRoot } from '../../aggregate.root';
import type { User } from './entities/user.entity';
import type { UserEmail } from './value-objects/user-email.value-object';
import type { UserID } from './value-objects/user-id.value-object';
import type { UserName } from './value-objects/user-name.value-object';
import type { UserPassword } from './value-objects/user-password.value-object';

/**
 * Agregado raíz de Usuario.
 * Encapsula el acceso a la entidad Usuario y mantiene la consistencia del agregado.
 */
export class UserAggregate extends AggregateRoot<UserID> {
  private readonly _user: User;

  constructor(user: User) {
    super(user.id);
    this._user = user;

    // Transferimos los eventos de dominio de la entidad al agregado
    for (const event of this._user.getDomainEvents()) {
      this.addDomainEvent(event);
    }
    this._user.clearEvents();
  }

  /**
   * Obtiene la entidad de usuario encapsulada
   */
  get user(): User {
    return this._user;
  }

  /**
   * Cambia el nombre del usuario
   * @param name - Nuevo nombre del usuario
   * @returns Result con éxito o error
   */
  changeName(name: UserName): Result<void> {
    // Aplicamos la operación en la entidad
    const result = this._user.changeName(name);

    // Si fue exitoso, transferimos los eventos generados
    if (result.isSuccess()) {
      for (const event of this._user.getDomainEvents()) {
        this.addDomainEvent(event);
      }
      this._user.clearEvents();
    }

    return result;
  }

  /**
   * Cambia el email del usuario
   * @param email - Nuevo email del usuario
   * @returns Result con éxito o error
   */
  changeEmail(email: UserEmail): Result<void> {
    // Aplicamos la operación en la entidad
    const result = this._user.changeEmail(email);

    // Si fue exitoso, transferimos los eventos generados
    if (result.isSuccess()) {
      for (const event of this._user.getDomainEvents()) {
        this.addDomainEvent(event);
      }
      this._user.clearEvents();
    }

    return result;
  }

  /**
   * Cambia la contraseña del usuario
   * @param currentPassword - Contraseña actual en texto plano
   * @param newPassword - Nueva contraseña
   * @returns Promise<Result<void>> - Result con éxito o error
   */
  async changePassword(
    currentPassword: string,
    newPassword: UserPassword,
  ): Promise<Result<void>> {
    // Aplicamos la operación en la entidad
    const result = await this._user.changePassword(
      currentPassword,
      newPassword,
    );

    // Si fue exitoso, transferimos los eventos generados
    if (result.isSuccess()) {
      for (const event of this._user.getDomainEvents()) {
        this.addDomainEvent(event);
      }
      this._user.clearEvents();
    }

    return result;
  }

  /**
   * Restablece la contraseña de un usuario sin verificar la actual
   * @param newPassword - Nueva contraseña
   */
  async resetPassword(newPassword: UserPassword): Promise<void> {
    await this._user.resetPassword(newPassword);

    // Transferimos los eventos generados por la operación
    for (const event of this._user.getDomainEvents()) {
      this.addDomainEvent(event);
    }
    this._user.clearEvents();
  }

  /**
   * Activa el usuario
   * @returns Result con éxito o error
   */
  activate(): Result<void> {
    // Aplicamos la operación en la entidad
    const result = this._user.activate();

    // Si fue exitoso, transferimos los eventos generados
    if (result.isSuccess()) {
      for (const event of this._user.getDomainEvents()) {
        this.addDomainEvent(event);
      }
      this._user.clearEvents();
    }

    return result;
  }

  /**
   * Desactiva el usuario
   * @returns Result con éxito o error
   */
  deactivate(): Result<void> {
    // Aplicamos la operación en la entidad
    const result = this._user.deactivate();

    // Si fue exitoso, transferimos los eventos generados
    if (result.isSuccess()) {
      for (const event of this._user.getDomainEvents()) {
        this.addDomainEvent(event);
      }
      this._user.clearEvents();
    }

    return result;
  }

  /**
   * Verifica si una contraseña coincide con la almacenada
   * @param plainPassword - Contraseña en texto plano
   * @returns Promise<boolean> - true si la contraseña es correcta
   */
  async verifyPassword(plainPassword: string): Promise<boolean> {
    return this._user.verifyPassword(plainPassword);
  }
}
