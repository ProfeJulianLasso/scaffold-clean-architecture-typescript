import { IDValueObject } from '@common/value-objects';

/**
 * Value Object que representa el identificador único de un usuario
 */
export class UserID extends IDValueObject {
  /**
   * Crea una nueva instancia de UserID
   * @param value - ID existente (opcional, se generará automáticamente si no se proporciona)
   */
  constructor(value?: string) {
    // Pasamos un nombre personalizado para mejorar los mensajes de error
    super(value, { objectName: 'UserID' });
  }

  /**
   * Implementación de la validación específica para IDs de usuario
   * @param value - Valor a validar
   */
  protected validateID(value: string): void {
    // Aquí podríamos agregar validaciones específicas para IDs de usuario
    // Por ejemplo, verificar si pertenece a un rango específico o cumple con reglas adicionales
    // En este caso simple, no necesitamos validación adicional
  }
}
