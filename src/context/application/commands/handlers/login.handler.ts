import type { LoginDTORequest } from '@application/dtos/requests/login.dto.request';
import type { LoginDTOResponse } from '@application/dtos/responses/login.dto.response';
import type { Result } from '@common/utils/result-pattern/result.pattern';
import type { IUserRepository } from '@domain/repositories/user.repository';
import type { ITokenService } from '@domain/services/token.service';
import { LoginCommand } from '../implementations/login.command';

/**
 * Manejador para el comando de login
 */
export class LoginHandler {
  private readonly _loginCommand: LoginCommand;

  /**
   * @param userRepository - Repositorio de usuarios
   * @param tokenService - Servicio de tokens
   */
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
  ) {
    this._loginCommand = new LoginCommand(userRepository, tokenService);
  }

  /**
   * Maneja la solicitud de inicio de sesión
   * @param request - DTO con los datos de solicitud
   * @returns Promise con el resultado de la operación
   */
  async handle(request: LoginDTORequest): Promise<Result<LoginDTOResponse>> {
    return this._loginCommand.execute(request);
  }
}
