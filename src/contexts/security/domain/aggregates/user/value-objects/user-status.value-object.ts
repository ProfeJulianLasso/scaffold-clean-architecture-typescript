import {
  BooleanValueObject,
  type BooleanValueObjectOptions,
} from '@shared/domain/value-objects/boolean.value-object.abstract';

/**
 * Objeto de valor para el estado de un usuario (activo/inactivo)
 */
export class UserStatus extends BooleanValueObject {
  constructor(value = true) {
    const options: BooleanValueObjectOptions = {
      objectName: 'UserStatus',
      allowNull: false,
    };

    super(value, options);
  }

  protected validateBoolean(value: boolean): void {
    // No se requieren validaciones adicionales más allá de las proporcionadas por las opciones
  }

  /**
   * Método auxiliar para verificar si el usuario está activo
   */
  isActive(): boolean {
    return this.value;
  }

  /**
   * Método auxiliar para verificar si el usuario está inactivo
   */
  isInactive(): boolean {
    return !this.value;
  }
}
