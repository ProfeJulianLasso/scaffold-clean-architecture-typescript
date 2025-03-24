// src/context/infrastructure/mappers/user.mapper.ts
import { userFactory } from 'src/context/domain/aggregates/users/user.factory';
import type { UserAggregate } from '../../domain/aggregates/users/user.aggregate';
import type { UserSchema } from '../persistence/schemas/user.schema';

/**
 * Mapper para convertir entre entidades de dominio y esquemas de persistencia
 */
export const userMapper = {
  /**
   * Convierte un documento MongoDB a un agregado de dominio
   * @param userDocument - Documento de usuario de MongoDB
   * @returns Agregado de usuario de dominio
   */
  toDomain(userDocument: UserSchema): UserAggregate {
    return userFactory.reconstituteAggregate({
      id: userDocument._id,
      name: userDocument.name,
      email: userDocument.email,
      hashedPassword: userDocument.password,
      active: userDocument.active,
    });
  },

  /**
   * Convierte un agregado de dominio a un objeto para persistencia
   * @param userAggregate - Agregado de usuario de dominio
   * @returns Objeto para persistencia en MongoDB
   */
  async toPersistence(
    userAggregate: UserAggregate,
  ): Promise<Record<string, unknown>> {
    const user = userAggregate.user;
    const password = await user.getPassword();

    return {
      _id: userAggregate.id.value,
      name: user.name.value,
      email: user.email.value,
      password: password.toString(),
      active: user.isActive,
    };
  },
};
