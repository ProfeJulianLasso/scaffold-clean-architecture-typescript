import { UserAggregate } from './user.aggregate';
import { UserEmail } from './value-objects/user-email.value-object';
import { UserId } from './value-objects/user-id.value-object';
import { UserName } from './value-objects/user-name.value-object';
import { UserPassword } from './value-objects/user-password.value-object';
import { UserStatus } from './value-objects/user-status.value-object';

/**
 * Fábrica para la creación de usuarios
 */
export const userFactory = {
  /**
   * Crea un nuevo usuario con un ID generado automáticamente
   */
  create(
    name: string,
    email: string,
    password: string,
    isActive = true,
  ): UserAggregate {
    const userId = new UserId();
    const userName = new UserName(name);
    const userEmail = new UserEmail(email);
    const userPassword = new UserPassword(password);
    const userStatus = new UserStatus(isActive);

    return UserAggregate.create(
      userId,
      userName,
      userEmail,
      userPassword,
      userStatus,
    );
  },

  /**
   * Reconstruye un usuario a partir de datos primitivos
   */
  reconstruct(
    id: string,
    name: string,
    email: string,
    password: string,
    isActive = true,
  ): UserAggregate {
    const userId = new UserId(id);
    const userName = new UserName(name);
    const userEmail = new UserEmail(email);
    const userPassword = new UserPassword(password);
    const userStatus = new UserStatus(isActive);

    return new UserAggregate(
      userId,
      userName,
      userEmail,
      userPassword,
      userStatus,
    );
  },
};
