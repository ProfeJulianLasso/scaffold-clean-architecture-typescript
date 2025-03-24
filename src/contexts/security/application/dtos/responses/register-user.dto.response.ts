/**
 * DTO para la respuesta del registro de un nuevo usuario
 */
export class RegisterUserDTOResponse {
  /**
   * @param success - Indica si la operación fue exitosa
   * @param message - Mensaje descriptivo del resultado
   * @param userId - ID del usuario creado (opcional, solo en caso de éxito)
   */
  constructor(
    readonly success: boolean,
    readonly message: string,
    readonly userId?: string,
  ) {}
}
