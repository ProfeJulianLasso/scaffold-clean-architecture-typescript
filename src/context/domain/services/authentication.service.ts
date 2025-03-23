import { ErrorType, ResultException } from '@common/exceptions';
import { Result } from '@common/utils/result-pattern';
import { UserAggregate } from '../aggregates/users/user.aggregate';
import { UserEmail } from '../aggregates/users/value-objects/user-email.value-object';
import { IUserRepository } from '../repositories/user.repository';

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
