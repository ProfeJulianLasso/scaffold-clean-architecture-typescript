/**
 * DTO para la respuesta del inicio de sesión
 */
export class LoginDTOResponse {
  /**
   * @param success - Indica si la operación fue exitosa
   * @param message - Mensaje descriptivo del resultado
   * @param token - Token JWT (opcional, solo en caso de éxito)
   * @param userId - ID del usuario (opcional, solo en caso de éxito)
   * @param name - Nombre del usuario (opcional, solo en caso de éxito)
   */
  constructor(
    readonly success: boolean,
    readonly message: string,
    readonly token?: string,
    readonly userId?: string,
    readonly name?: string,
  ) {}
}
