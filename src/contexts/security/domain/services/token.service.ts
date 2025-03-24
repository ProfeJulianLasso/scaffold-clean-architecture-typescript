import type { Result } from '@common/utils/result-pattern/result.pattern';

/**
 * Interfaz de servicio para la gestión de tokens JWT
 * Definida en el dominio y utilizada por la capa de aplicación
 */
export interface ITokenService {
  /**
   * Genera un nuevo token JWT
   * @param payload - Datos a incluir en el token
   * @param expiresIn - Tiempo de expiración del token (opcional)
   * @returns Result con el token generado
   */
  generateToken(
    payload: Record<string, unknown>,
    expiresIn?: string,
  ): Promise<Result<string>>;

  /**
   * Verifica y decodifica un token JWT
   * @param token - Token a verificar
   * @returns Result con el payload decodificado
   */
  verifyToken(token: string): Promise<Result<Record<string, unknown>>>;
}
