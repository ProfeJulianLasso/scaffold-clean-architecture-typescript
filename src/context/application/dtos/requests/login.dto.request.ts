/**
 * DTO para la solicitud de inicio de sesión
 */
export class LoginDTORequest {
  /**
   * @param email - Dirección de correo electrónico
   * @param password - Contraseña en texto plano
   */
  constructor(
    readonly email: string,
    readonly password: string,
  ) {}
}
