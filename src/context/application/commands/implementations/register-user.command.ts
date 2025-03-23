import { ErrorType } from '@common/exceptions';
import { Result } from '@common/utils/result-pattern';
import { UserFactory } from '../../../domain/aggregates/users/user.factory';
import { UserEmail } from '../../../domain/aggregates/users/value-objects/user-email.value-object';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { RegisterUserDTORequest } from '../../dtos/requests/register-user.dto.request';
import { RegisterUserDTOResponse } from '../../dtos/responses/register-user.dto.response';
import { ApplicationException } from '../../exceptions/application.exception';
import { IRegisterUserCommand } from '../interfaces/register-user.command.interface';

/**
 * Implementación del comando para registrar un nuevo usuario
 */
export class RegisterUserCommand implements IRegisterUserCommand {
  /**
   * @param _userRepository - Repositorio de usuarios
   */
  constructor(private readonly _userRepository: IUserRepository) {}

  /**
   * Ejecuta el comando de registro
   * @param request - DTO con los datos de solicitud
   * @returns Promise con el resultado de la operación
   */
  public async execute(
    request: RegisterUserDTORequest,
  ): Promise<Result<RegisterUserDTOResponse>> {
    try {
      // Validamos el email
      const userEmail = new UserEmail(request.email);

      // Verificamos si ya existe un usuario con ese email
      const existsResult = await this._userRepository.exists(userEmail);

      if (existsResult.isFailure()) {
        return Result.failure(existsResult.getError());
      }

      if (existsResult.getValue()) {
        return Result.fail(ErrorType.CONFLICT, 'El email ya está registrado', {
          code: 'EMAIL_ALREADY_EXISTS',
          source: 'register-user.command',
        });
      }

      // Creamos el agregado de usuario
      const userAggregateResult = await Result.tryAsync(async () => {
        return await UserFactory.createAggregate({
          name: request.name,
          email: request.email,
          password: request.password,
          active: true,
        });
      });

      if (userAggregateResult.isFailure()) {
        return Result.failure(userAggregateResult.getError());
      }

      const userAggregate = userAggregateResult.getValue();

      // Guardamos el usuario en el repositorio
      const saveResult = await this._userRepository.save(userAggregate);

      if (saveResult.isFailure()) {
        return Result.failure(saveResult.getError());
      }

      // Retornamos respuesta exitosa
      return Result.success(
        new RegisterUserDTOResponse(
          true,
          'Usuario registrado exitosamente',
          userAggregate.id.value,
        ),
      );
    } catch (error) {
      // Convertimos cualquier error inesperado a ApplicationException
      return Result.failure(
        ApplicationException.useCaseError(
          'RegisterUserCommand',
          error instanceof Error ? error.message : 'Error desconocido',
        ),
      );
    }
  }
}
