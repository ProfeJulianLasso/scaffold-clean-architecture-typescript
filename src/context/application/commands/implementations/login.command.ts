import type { ICommand } from '@common/application-commands/command.interface';
import { ErrorType } from '@common/exceptions/result.exception';
import { Result } from '@common/utils/result-pattern/result.pattern';
import { UserEmail } from '@domain/aggregates/users/value-objects/user-email.value-object';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import type { ITokenService } from '../../../domain/services/token.service';
import type { LoginDTORequest } from '../../dtos/requests/login.dto.request';
import { LoginDTOResponse } from '../../dtos/responses/login.dto.response';
import { ApplicationException } from '../../exceptions/application.exception';

/**
 * Implementación del comando para iniciar sesión
 */
export class LoginCommand
  implements ICommand<LoginDTORequest, LoginDTOResponse>
{
  /**
   * @param _userRepository - Repositorio de usuarios
   * @param _tokenService - Servicio de tokens
   */
  constructor(
    private readonly _userRepository: IUserRepository,
    private readonly _tokenService: ITokenService,
  ) {}

  /**
   * Ejecuta el comando de login
   * @param request - DTO con los datos de solicitud
   * @returns Promise con el resultado de la operación
   */
  async execute(request: LoginDTORequest): Promise<Result<LoginDTOResponse>> {
    try {
      // Validamos el email
      const userEmail = new UserEmail(request.email);

      // Buscamos el usuario por email
      const userResult = await this._userRepository.findByEmail(userEmail);

      if (userResult.isFailure()) {
        return Result.failure(userResult.getError());
      }

      const userAggregate = userResult.getValue();

      // Verificamos si el usuario existe
      if (!userAggregate) {
        return Result.fail(ErrorType.UNAUTHORIZED, 'Credenciales inválidas', {
          code: 'INVALID_CREDENTIALS',
          source: 'login.command',
        });
      }

      // Verificamos si el usuario está activo
      if (!userAggregate.user.isActive) {
        return Result.fail(ErrorType.UNAUTHORIZED, 'El usuario está inactivo', {
          code: 'USER_INACTIVE',
          source: 'login.command',
        });
      }

      // Verificamos la contraseña
      const passwordValid = await userAggregate.verifyPassword(
        request.password,
      );

      if (!passwordValid) {
        return Result.fail(ErrorType.UNAUTHORIZED, 'Credenciales inválidas', {
          code: 'INVALID_CREDENTIALS',
          source: 'login.command',
        });
      }

      // Generamos token JWT
      const tokenPayload = {
        userId: userAggregate.id.value,
        email: userAggregate.user.email.value,
        name: userAggregate.user.name.value,
      };

      const tokenResult = await this._tokenService.generateToken(tokenPayload);

      if (tokenResult.isFailure()) {
        return Result.failure(tokenResult.getError());
      }

      // Retornamos respuesta exitosa
      return Result.success(
        new LoginDTOResponse(
          true,
          'Inicio de sesión exitoso',
          tokenResult.getValue(),
        ),
      );
    } catch (error) {
      // Convertimos cualquier error inesperado a ApplicationException
      return Result.failure(
        ApplicationException.useCaseError(
          'LoginCommand',
          error instanceof Error ? error.message : 'Error desconocido',
        ),
      );
    }
  }
}
