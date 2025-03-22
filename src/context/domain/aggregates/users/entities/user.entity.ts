import { Entity } from '@common/entities/entity.abstract';
import { UserCreatedEvent } from '../events/user-created.event';
import { UserUpdatedEvent } from '../events/user-updated.event';
import { UserActive } from '../value-objects/user-active.value-object';
import { UserEmail } from '../value-objects/user-email.value-object';
import { UserID } from '../value-objects/user-id.value-object';
import { UserName } from '../value-objects/user-name.value-object';
import { UserPassword } from '../value-objects/user-password.value-object';

/**
 * Entidad Usuario que representa a un usuario en el sistema
 */
export class User extends Entity<UserID> {
  private _name: UserName;
  private _email: UserEmail;
  private _active: UserActive;
  private _password: UserPassword;

  /**
   * Constructor privado. Utilizar factory methods para crear instancias.
   */
  private constructor(
    id: UserID,
    name: UserName,
    email: UserEmail,
    password: UserPassword,
    active: UserActive,
  ) {
    super(id);
    this._name = name;
    this._email = email;
    this._password = password;
    this._active = active;
  }

  /**
   * Crea un nuevo usuario
   * @param id - Identificador único (opcional, se genera automáticamente si no se proporciona)
   * @param name - Nombre del usuario
   * @param email - Email del usuario
   * @param password - Contraseña del usuario (en texto plano)
   * @param active - Estado de activación (opcional, activo por defecto)
   * @returns Promise con la nueva instancia de Usuario
   */
  public static async create(
    id: UserID | undefined,
    name: UserName,
    email: UserEmail,
    password: UserPassword,
    active?: UserActive,
  ): Promise<User> {
    // Si no se proporciona un ID, se crea uno nuevo
    const userId = id || new UserID();

    // Si no se proporciona un estado de activación, se considera activo
    const userActive = active || new UserActive(true);

    // Hashear la contraseña si no está ya hasheada
    const hashedPassword = await password.hash();

    // Crear la instancia de usuario
    const user = new User(userId, name, email, hashedPassword, userActive);

    // Registrar evento de creación
    user.addDomainEvent(new UserCreatedEvent(user));

    return user;
  }

  /**
   * Cambia el nombre del usuario
   * @param newName - Nuevo nombre
   */
  public changeName(newName: UserName): void {
    this._name = newName;
    this.registerUpdateEvent();
  }

  /**
   * Cambia el email del usuario
   * @param newEmail - Nuevo email
   */
  public changeEmail(newEmail: UserEmail): void {
    this._email = newEmail;
    this.registerUpdateEvent();
  }

  /**
   * Cambia la contraseña del usuario
   * @param currentPassword - Contraseña actual en texto plano
   * @param newPassword - Nueva contraseña en texto plano
   * @returns Promise<boolean> - true si el cambio fue exitoso
   */
  public async changePassword(
    currentPassword: string,
    newPassword: UserPassword,
  ): Promise<boolean> {
    // Verificar la contraseña actual
    const isValid = await this._password.compare(currentPassword);

    if (!isValid) {
      return false;
    }

    // Hashear y establecer la nueva contraseña
    this._password = await newPassword.hash();

    this.registerUpdateEvent();
    return true;
  }

  /**
   * Establece una nueva contraseña sin verificar la anterior
   * Útil para reestablecer contraseñas por admin o recuperación
   * @param newPassword - Nueva contraseña
   */
  public async resetPassword(newPassword: UserPassword): Promise<void> {
    this._password = await newPassword.hash();
    this.registerUpdateEvent();
  }

  /**
   * Activa el usuario
   */
  public activate(): void {
    if (this._active.value) return; // Ya está activo

    this._active = this._active.activate();
    this.registerUpdateEvent();
  }

  /**
   * Desactiva el usuario
   */
  public deactivate(): void {
    if (!this._active.value) return; // Ya está inactivo

    this._active = this._active.deactivate();
    this.registerUpdateEvent();
  }

  /**
   * Verifica si la contraseña proporcionada es correcta
   * @param plainPassword - Contraseña en texto plano
   * @returns Promise<boolean> - true si la contraseña es correcta
   */
  public async verifyPassword(plainPassword: string): Promise<boolean> {
    return this._password.compare(plainPassword);
  }

  /**
   * Registra un evento de actualización
   */
  private registerUpdateEvent(): void {
    this.addDomainEvent(new UserUpdatedEvent(this));
  }

  // Getters para acceder a los atributos

  public get name(): UserName {
    return this._name;
  }

  public get email(): UserEmail {
    return this._email;
  }

  public get active(): UserActive {
    return this._active;
  }

  public get isActive(): boolean {
    return this._active.value;
  }

  /**
   * Sobrescribe toJSON para serializar la entidad
   * No incluye la contraseña por seguridad
   */
  public toJSON(): object {
    return {
      ...super.toJSON(),
      name: this._name.value,
      email: this._email.value,
      active: this._active.value,
      // La contraseña no se incluye intencionalmente
    };
  }

  /**
   * Método de reconstitución para instanciar un usuario a partir de datos persistidos
   * Este método no genera eventos de dominio, pues se usa para reconstruir un estado
   */
  public static reconstitute(
    id: UserID,
    name: UserName,
    email: UserEmail,
    password: UserPassword,
    active: UserActive,
  ): User {
    const user = new User(id, name, email, password, active);
    // No generamos eventos de dominio en la reconstitución
    return user;
  }
}
