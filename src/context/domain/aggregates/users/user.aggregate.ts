import { AggregateRoot } from '../../aggregate.root';
import { User } from './entities/user.entity';
import { UserEmail } from './value-objects/user-email.value-object';
import { UserID } from './value-objects/user-id.value-object';
import { UserName } from './value-objects/user-name.value-object';
import { UserPassword } from './value-objects/user-password.value-object';

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
    this._user.getDomainEvents().forEach(event => {
      this.addDomainEvent(event);
    });
    this._user.clearEvents();
  }

  /**
   * Obtiene la entidad de usuario encapsulada
   */
  public get user(): User {
    return this._user;
  }

  /**
   * Cambia el nombre del usuario
   * @param name - Nuevo nombre del usuario
   */
  public changeName(name: UserName): void {
    this._user.changeName(name);

    // Transferimos los eventos generados por la operación
    this._user.getDomainEvents().forEach(event => {
      this.addDomainEvent(event);
    });
    this._user.clearEvents();
  }

  /**
   * Cambia el email del usuario
   * @param email - Nuevo email del usuario
   */
  public changeEmail(email: UserEmail): void {
    this._user.changeEmail(email);

    // Transferimos los eventos generados por la operación
    this._user.getDomainEvents().forEach(event => {
      this.addDomainEvent(event);
    });
    this._user.clearEvents();
  }

  /**
   * Cambia la contraseña del usuario
   * @param currentPassword - Contraseña actual en texto plano
   * @param newPassword - Nueva contraseña
   * @returns Promise<boolean> - true si el cambio fue exitoso
   */
  public async changePassword(
    currentPassword: string,
    newPassword: UserPassword,
  ): Promise<boolean> {
    const result = await this._user.changePassword(
      currentPassword,
      newPassword,
    );

    if (result) {
      // Transferimos los eventos generados por la operación
      this._user.getDomainEvents().forEach(event => {
        this.addDomainEvent(event);
      });
      this._user.clearEvents();
    }

    return result;
  }

  /**
   * Restablece la contraseña de un usuario sin verificar la actual
   * @param newPassword - Nueva contraseña
   */
  public async resetPassword(newPassword: UserPassword): Promise<void> {
    await this._user.resetPassword(newPassword);

    // Transferimos los eventos generados por la operación
    this._user.getDomainEvents().forEach(event => {
      this.addDomainEvent(event);
    });
    this._user.clearEvents();
  }

  /**
   * Activa el usuario
   */
  public activate(): void {
    this._user.activate();

    // Transferimos los eventos generados por la operación
    this._user.getDomainEvents().forEach(event => {
      this.addDomainEvent(event);
    });
    this._user.clearEvents();
  }

  /**
   * Desactiva el usuario
   */
  public deactivate(): void {
    this._user.deactivate();

    // Transferimos los eventos generados por la operación
    this._user.getDomainEvents().forEach(event => {
      this.addDomainEvent(event);
    });
    this._user.clearEvents();
  }

  /**
   * Verifica si una contraseña coincide con la almacenada
   * @param plainPassword - Contraseña en texto plano
   * @returns Promise<boolean> - true si la contraseña es correcta
   */
  public async verifyPassword(plainPassword: string): Promise<boolean> {
    return this._user.verifyPassword(plainPassword);
  }
}
