import {
  ErrorType,
  ResultException,
} from '@common/exceptions/result.exception';
import type { Result } from '@common/utils/result-pattern/result.pattern';
import type { UserAggregate } from '../aggregates/users/user.aggregate';
import type { UserEmail } from '../aggregates/users/value-objects/user-email.value-object';
import type { IUserRepository } from '../repositories/user.repository';

export class AuthenticationService {
  constructor(private readonly _userRepository: IUserRepository) {}

  authenticate(
    email: UserEmail,
    password: string,
  ): Promise<Result<UserAggregate>> {
    throw new ResultException(ErrorType.DOMAIN, 'NotImplemented', {
      statusCode: 501,
    });
  }
}
