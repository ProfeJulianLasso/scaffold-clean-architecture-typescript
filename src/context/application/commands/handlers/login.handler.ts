import { Result } from '@common/utils/result-pattern';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { ITokenService } from '../../../domain/services/token.service';
import { LoginDTORequest } from '../../dtos/requests/login.dto.request';
import { LoginDTOResponse } from '../../dtos/responses/login.dto.response';
import { LoginCommand } from '../implementations/login.command';

/**
 * Manejador para el comando de login
 */
export class LoginHandler {
  private readonly _loginCommand: LoginCommand;

  /**
   * @param _userRepository - Repositorio de usuarios
   * @param _tokenService - Servicio de tokens
   */
  constructor(
    private readonly _userRepository: IUserRepository,
    private readonly _tokenService: ITokenService,
  ) {
    this._loginCommand = new LoginCommand(_userRepository, _tokenService);
  }

  /**
   * Maneja la solicitud de inicio de sesión
   * @param request - DTO con los datos de solicitud
   * @returns Promise con el resultado de la operación
   */
  public async handle(
    request: LoginDTORequest,
  ): Promise<Result<LoginDTOResponse>> {
    return this._loginCommand.execute(request);
  }
}
