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
    readonly name: string,
    readonly email: string,
    readonly password: string,
  ) {}
}
