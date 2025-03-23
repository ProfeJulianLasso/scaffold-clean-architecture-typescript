import type { Result } from '@common/utils';
import type { LoginDTORequest } from '../../dtos/requests/login.dto.request';
import type { LoginDTOResponse } from '../../dtos/responses/login.dto.response';

/**
 * Interfaz para el comando de inicio de sesión
 */
export interface ILoginCommand {
  /**
   * Ejecuta el comando de login
   * @param request - DTO con los datos de solicitud
   * @returns Promise con el resultado de la operación
   */
  execute(request: LoginDTORequest): Promise<Result<LoginDTOResponse>>;
}
