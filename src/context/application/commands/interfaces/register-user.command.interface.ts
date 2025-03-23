import type { Result } from '@common/utils/result-pattern';
import type { RegisterUserDTORequest } from '../../dtos/requests/register-user.dto.request';
import type { RegisterUserDTOResponse } from '../../dtos/responses/register-user.dto.response';

/**
 * Interfaz para el comando de registro de usuario
 */
export interface IRegisterUserCommand {
  /**
   * Ejecuta el comando de registro
   * @param request - DTO con los datos de solicitud
   * @returns Promise con el resultado de la operación
   */
  execute(
    request: RegisterUserDTORequest,
  ): Promise<Result<RegisterUserDTOResponse>>;
}
