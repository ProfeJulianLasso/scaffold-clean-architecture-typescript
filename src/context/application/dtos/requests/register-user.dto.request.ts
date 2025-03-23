/**
 * DTO para la solicitud de registro de un nuevo usuario
 */
export class RegisterUserDTORequest {
  /**
   * @param name - Nombre completo del usuario
   * @param email - Dirección de correo electrónico
   * @param password - Contraseña en texto plano
   */
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly password: string,
  ) {}
}
