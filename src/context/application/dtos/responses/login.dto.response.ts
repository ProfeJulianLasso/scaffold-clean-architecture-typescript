/**
 * DTO para la respuesta del inicio de sesión
 */
export class LoginDTOResponse {
  /**
   * @param success - Indica si la operación fue exitosa
   * @param message - Mensaje descriptivo del resultado
   * @param token - Token JWT generado (opcional, solo en caso de éxito)
   */
  constructor(
    readonly success: boolean,
    readonly message: string,
    readonly token?: string,
  ) {}
}
