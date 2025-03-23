import { Result } from '@common/utils/result-pattern';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { RegisterUserDTORequest } from '../../dtos/requests/register-user.dto.request';
import { RegisterUserDTOResponse } from '../../dtos/responses/register-user.dto.response';
import { RegisterUserCommand } from '../implementations/register-user.command';

/**
 * Manejador para el comando de registro de usuario
 */
export class RegisterUserHandler {
  private readonly _registerUserCommand: RegisterUserCommand;

  /**
   * @param _userRepository - Repositorio de usuarios
   */
  constructor(private readonly _userRepository: IUserRepository) {
    this._registerUserCommand = new RegisterUserCommand(_userRepository);
  }

  /**
   * Maneja la solicitud de registro de usuario
   * @param request - DTO con los datos de solicitud
   * @returns Promise con el resultado de la operación
   */
  public async handle(
    request: RegisterUserDTORequest,
  ): Promise<Result<RegisterUserDTOResponse>> {
    return this._registerUserCommand.execute(request);
  }
}
