import { IDValueObject } from '@shared/domain/value-objects/id.value-object.abstract';

/**
 * Objeto de valor para el ID de un usuario
 */
export class UserId extends IDValueObject {
  protected validateID(value: string): void {
    // No se requieren validaciones adicionales más allá de las proporcionadas por IDValueObject
  }
}
