import type { Result } from '@common/utils/result-pattern/result.pattern';
import type { UserAggregate } from './aggregates/user/user.aggregate';

/**
 * Interfaz de servicios de dominio para el contexto de seguridad
 */
export interface ISecurityDomain {
  /**
   * Registra un nuevo usuario en el sistema
   */
  registerUser(
    name: string,
    email: string,
    password: string,
  ): Promise<Result<UserAggregate>>;
}
