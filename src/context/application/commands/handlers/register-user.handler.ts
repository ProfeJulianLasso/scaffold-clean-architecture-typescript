import type { Result } from '@common/utils/result-pattern';
import type { IUserRepository } from '@domain';
import type {
  RegisterUserDTORequest,
  RegisterUserDTOResponse,
} from '../../dtos';
import { RegisterUserCommand } from '../implementations';

/**
 * Manejador para el comando de registro de usuario
 */
export class RegisterUserHandler {
  private readonly _registerUserCommand: RegisterUserCommand;

  /**
   * @param userRepository - Repositorio de usuarios
   */
  constructor(private readonly userRepository: IUserRepository) {
    this._registerUserCommand = new RegisterUserCommand(this.userRepository);
  }

  /**
   * Maneja la solicitud de registro de usuario
   * @param request - DTO con los datos de solicitud
   * @returns Promise con el resultado de la operación
   */
  async handle(
    request: RegisterUserDTORequest,
  ): Promise<Result<RegisterUserDTOResponse>> {
    return this._registerUserCommand.execute(request);
  }
}
