import { ErrorType } from '@common/exceptions/result.exception';
import { Result } from '@common/utils/result-pattern/result.pattern';
import { Injectable } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import type { ITokenService } from '../../domain/services/token.service';

/**
 * Implementación de servicio de tokens con JWT
 */
@Injectable()
export class JwtTokenService implements ITokenService {
  /**
   * @param _jwtService - Servicio JWT de NestJS
   * @param _configService - Servicio de configuración de NestJS
   */
  constructor(
    private readonly _jwtService: JwtService,
    private readonly _configService: ConfigService,
  ) {}

  /**
   * Genera un nuevo token JWT
   * @param payload - Datos a incluir en el token
   * @param expiresIn - Tiempo de expiración del token (opcional)
   * @returns Result con el token generado
   */
  async generateToken(
    payload: Record<string, unknown>,
    expiresIn?: string,
  ): Promise<Result<string>> {
    try {
      const defaultExpiresIn = this._configService.get<string>(
        'JWT_EXPIRES_IN',
        '1h',
      );

      const token = this._jwtService.sign(payload, {
        expiresIn: expiresIn ?? defaultExpiresIn,
      });

      return Result.success(token);
    } catch (error) {
      return Result.fail(
        ErrorType.INFRASTRUCTURE,
        `Error al generar token JWT: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        {
          code: 'JWT_GENERATE_ERROR',
          source: 'jwt-token.service',
        },
      );
    }
  }

  /**
   * Verifica y decodifica un token JWT
   * @param token - Token a verificar
   * @returns Result con el payload decodificado
   */
  async verifyToken(token: string): Promise<Result<Record<string, unknown>>> {
    try {
      const payload = this._jwtService.verify(token);
      return Result.success(payload);
    } catch (error) {
      return Result.fail(
        ErrorType.UNAUTHORIZED,
        `Token JWT inválido: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        {
          code: 'JWT_INVALID_TOKEN',
          source: 'jwt-token.service',
        },
      );
    }
  }
}
