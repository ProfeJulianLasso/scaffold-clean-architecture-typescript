import { Result } from '@common/utils';

export interface IUserManagementUseCase {
  registerUser(data: RegisterUserDTO): Promise<Result<UserDTO>>;
  // Más operaciones
}
