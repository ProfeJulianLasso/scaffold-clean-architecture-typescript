import { Result } from '@common/utils';

export interface IUserPersistencePort {
  saveUser(user: UserPersistenceModel): Promise<Result<void>>;
  // Más operaciones
}
