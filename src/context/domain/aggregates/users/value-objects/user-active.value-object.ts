import { BooleanValueObject } from '@common/value-objects/boolean.value-object.abstract';

/**
 * Value Object que representa el estado activo/inactivo de un usuario
 */
export class UserActive extends BooleanValueObject {
  /**
   * Crea una nueva instancia de UserActive
   * @param value - Valor booleano que indica si el usuario está activo
   */
  constructor(value: boolean | null | undefined = true) {
    super(value, {
      objectName: 'UserActive',
      allowNull: true,
      defaultValue: true, // Por defecto los usuarios están activos
      convertValues: true, // Permite convertir strings "true"/"false" en booleanos
    });
  }

  /**
   * Validaciones adicionales específicas para el estado activo
   * En este caso simple no necesitamos validaciones adicionales
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  protected validateBoolean(value: boolean): void {
    // No se requieren validaciones adicionales
  }

  /**
   * Activa el usuario
   * @returns Nueva instancia con el usuario activo
   */
  public activate(): UserActive {
    if (this.value) return this; // Ya está activo
    return new UserActive(true);
  }

  /**
   * Desactiva el usuario
   * @returns Nueva instancia con el usuario inactivo
   */
  public deactivate(): UserActive {
    if (!this.value) return this; // Ya está inactivo
    return new UserActive(false);
  }

  /**
   * Mensaje descriptivo según el estado
   */
  public getStatusMessage(): string {
    return this.value ? 'Usuario activo' : 'Usuario inactivo';
  }
}
