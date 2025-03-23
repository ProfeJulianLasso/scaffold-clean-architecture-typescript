/* eslint-disable no-unused-vars */
import { Result } from '@common/utils/result-pattern';
import { UserAggregate } from '../aggregates/users/user.aggregate';
import { UserEmail } from '../aggregates/users/value-objects/user-email.value-object';
import { UserID } from '../aggregates/users/value-objects/user-id.value-object';

export interface IUserRepository {
  findById(id: UserID): Promise<Result<UserAggregate | null>>;
  findByEmail(email: UserEmail): Promise<Result<UserAggregate | null>>;
  save(userAggregate: UserAggregate): Promise<Result<void>>;
  delete(id: UserID): Promise<Result<void>>;
}
