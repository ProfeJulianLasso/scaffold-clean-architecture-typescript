import { Result } from '@common/utils/result-pattern';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { ITokenService } from '../../domain/services/token.service';
import { LoginHandler } from '../commands/handlers/login.handler';
import { RegisterUserHandler } from '../commands/handlers/register-user.handler';
import { LoginDTORequest } from '../dtos/requests/login.dto.request';
import { RegisterUserDTORequest } from '../dtos/requests/register-user.dto.request';
import { LoginDTOResponse } from '../dtos/responses/login.dto.response';
import { RegisterUserDTOResponse } from '../dtos/responses/register-user.dto.response';

/**
 * Servicio de aplicación para operaciones relacionadas con usuarios
 * Actúa como fachada para los casos de uso
 */
export class UserService {
  private readonly _registerUserHandler: RegisterUserHandler;
  private readonly _loginHandler: LoginHandler;

  /**
   * @param _userRepository - Repositorio de usuarios
   * @param _tokenService - Servicio de tokens
   */
  constructor(
    private readonly _userRepository: IUserRepository,
    private readonly _tokenService: ITokenService,
  ) {
    this._registerUserHandler = new RegisterUserHandler(_userRepository);
    this._loginHandler = new LoginHandler(_userRepository, _tokenService);
  }

  /**
   * Registra un nuevo usuario
   * @param request - DTO con los datos de solicitud
   * @returns Promise con el resultado de la operación
   */
  public async register(
    request: RegisterUserDTORequest,
  ): Promise<Result<RegisterUserDTOResponse>> {
    return this._registerUserHandler.handle(request);
  }

  /**
   * Realiza el inicio de sesión de un usuario
   * @param request - DTO con los datos de solicitud
   * @returns Promise con el resultado de la operación
   */
  public async login(
    request: LoginDTORequest,
  ): Promise<Result<LoginDTOResponse>> {
    return this._loginHandler.handle(request);
  }
}
