import { Entity } from '@common/entities/entity.abstract';
import { Result } from '@common/utils/result-pattern';
import { PasswordPolicy } from '../../../policies/password.policy';
import { UserActivationPolicy } from '../../../policies/user-activation.policy';
import { UserUpdatePolicy } from '../../../policies/user-update.policy';
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
   * @returns Result con éxito o error
   */
  public changeName(newName: UserName): Result<void> {
    // Aplicar política de cambio de nombre
    const policyResult = UserUpdatePolicy.canChangeName(this, newName);
    if (policyResult.isFailure()) {
      return policyResult;
    }

    this._name = newName;
    this.registerUpdateEvent();
    return Result.success();
  }

  /**
   * Cambia el email del usuario
   * @param newEmail - Nuevo email
   * @returns Result con éxito o error
   */
  public changeEmail(newEmail: UserEmail): Result<void> {
    // Aplicar política de cambio de email
    const policyResult = UserUpdatePolicy.canChangeEmail(this, newEmail);
    if (policyResult.isFailure()) {
      return policyResult;
    }

    this._email = newEmail;
    this.registerUpdateEvent();
    return Result.success();
  }

  /**
   * Cambia la contraseña del usuario
   * @param currentPassword - Contraseña actual en texto plano
   * @param newPassword - Nueva contraseña en texto plano
   * @returns Promise<Result> - Result con éxito o error
   */
  public async changePassword(
    currentPassword: string,
    newPassword: UserPassword,
  ): Promise<Result<void>> {
    // Aplicar política de cambio de contraseña
    const policyResult = await PasswordPolicy.canChangePassword(
      this._password,
      currentPassword,
      newPassword,
    );

    if (policyResult.isFailure()) {
      return policyResult;
    }

    // Hashear y establecer la nueva contraseña
    this._password = await newPassword.hash();

    this.registerUpdateEvent();
    return Result.success();
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
   * @returns Result con éxito o error
   */
  public activate(): Result<void> {
    // Aplicar política de activación
    const policyResult = UserActivationPolicy.canActivate(this);
    if (policyResult.isFailure()) {
      return policyResult;
    }

    this._active = this._active.activate();
    this.registerUpdateEvent();
    return Result.success();
  }

  /**
   * Desactiva el usuario
   * @returns Result con éxito o error
   */
  public deactivate(): Result<void> {
    // Aplicar política de desactivación
    const policyResult = UserActivationPolicy.canDeactivate(this);
    if (policyResult.isFailure()) {
      return policyResult;
    }

    this._active = this._active.deactivate();
    this.registerUpdateEvent();
    return Result.success();
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
