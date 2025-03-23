/**
 * DTO para la solicitud de inicio de sesión
 */
export class LoginDTORequest {
  /**
   * @param email - Dirección de correo electrónico
   * @param password - Contraseña en texto plano
   */
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}
}
