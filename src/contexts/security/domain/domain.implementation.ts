import { ErrorType } from '@common/exceptions/result.exception';
import { Result } from '@common/utils/result-pattern/result.pattern';
import type { UserAggregate } from './aggregates/user/user.aggregate';
import { userFactory } from './aggregates/user/user.factory';
import type { IUserRepository } from './aggregates/user/user.repository.interface';
import { UserEmail } from './aggregates/user/value-objects/user-email.value-object';
import type { ISecurityDomain } from './domain.interface';
import { securityException } from './exceptions/security.exception';

/**
 * Implementación de los servicios de dominio para el contexto de seguridad
 */
export class SecurityDomain implements ISecurityDomain {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Registra un nuevo usuario en el sistema
   */
  async registerUser(
    name: string,
    email: string,
    password: string,
  ): Promise<Result<UserAggregate>> {
    try {
      // Validar si ya existe un usuario con ese email
      const userEmail = new UserEmail(email);
      const existsResult = await this.userRepository.existsByEmail(userEmail);

      if (existsResult.isFailure()) {
        return Result.failure(existsResult.getError());
      }

      if (existsResult.getValue()) {
        return Result.failure(securityException.emailAlreadyInUse(email));
      }

      // Crear nuevo usuario
      const user = userFactory.create(name, email, password);

      // Persistir el usuario
      const saveResult = await this.userRepository.save(user);

      if (saveResult.isFailure()) {
        return Result.failure(saveResult.getError());
      }

      return Result.success(saveResult.getValue());
    } catch (error) {
      if (error instanceof Error) {
        return Result.fail(
          ErrorType.DOMAIN,
          `Error al registrar el usuario: ${error.message}`,
          {
            source: 'security-domain',
            metadata: { name, email },
          },
        );
      }
      return Result.fail(
        ErrorType.DOMAIN,
        'Error desconocido al registrar el usuario',
        {
          source: 'security-domain',
          metadata: { name, email },
        },
      );
    }
  }
}
