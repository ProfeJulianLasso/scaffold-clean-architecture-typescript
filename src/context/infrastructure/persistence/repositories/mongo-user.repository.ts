import { ErrorType } from '@common/exceptions';
import { Result } from '@common/utils/result-pattern';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import type { UserAggregate } from '../../../domain/aggregates/users/user.aggregate';
import type { UserEmail } from '../../../domain/aggregates/users/value-objects/user-email.value-object';
import type { UserID } from '../../../domain/aggregates/users/value-objects/user-id.value-object';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import { UserSchema } from '../schemas/user.schema';
import { userMapper } from '../../mappers/user.mapper';

/**
 * Implementación de MongoDB del repositorio de usuario
 */
@Injectable()
export class MongoUserRepository implements IUserRepository {
  /**
   * @param _userModel - Modelo de Mongoose para usuarios
   */
  constructor(
    @InjectModel(UserSchema.name)
    private readonly _userModel: Model<UserSchema>,
  ) {}

  /**
   * Busca un usuario por su ID
   * @param id - ID del usuario
   * @returns Result con el agregado de usuario o null si no existe
   */
  async findById(id: UserID): Promise<Result<UserAggregate | null>> {
    try {
      const userDocument = await this._userModel.findOne({ _id: id.value }).exec();

      if (!userDocument) {
        return Result.success(null);
      }

      return Result.success(userMapper.toDomain(userDocument));
    } catch (error) {
      return Result.fail(
        ErrorType.INFRASTRUCTURE,
        `Error al buscar usuario por ID: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        {
          code: 'DB_FIND_ERROR',
          source: 'mongo-user.repository',
          metadata: { id: id.value },
        },
      );
    }
  }

  /**
   * Busca un usuario por su email
   * @param email - Email del usuario
   * @returns Result con el agregado de usuario o null si no existe
   */
  async findByEmail(email: UserEmail): Promise<Result<UserAggregate | null>> {
    try {
      const userDocument = await this._userModel.findOne({ email: email.value }).exec();

      if (!userDocument) {
        return Result.success(null);
      }

      return Result.success(userMapper.toDomain(userDocument));
    } catch (error) {
      return Result.fail(
        ErrorType.INFRASTRUCTURE,
        `Error al buscar usuario por email: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        {
          code: 'DB_FIND_ERROR',
          source: 'mongo-user.repository',
          metadata: { email: email.value },
        },
      );
    }
  }

  /**
   * Guarda un usuario nuevo o actualiza uno existente
   * @param userAggregate - Agregado de usuario a guardar
   * @returns Result con éxito o error
   */
  async save(userAggregate: UserAggregate): Promise<Result<void>> {
    try {
      const userData = await userMapper.toPersistence(userAggregate);

      await this._userModel.findOneAndUpdate(
        { _id: userData._id },
        userData,
        { upsert: true, new: true },
      ).exec();

      return Result.success();
    } catch (error) {
      return Result.fail(
        ErrorType.INFRASTRUCTURE,
        `Error al guardar usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        {
          code: 'DB_SAVE_ERROR',
          source: 'mongo-user.repository',
          metadata: { id: userAggregate.id.value },
        },
      );
    }
  }

  /**
   * Verifica si existe un usuario con el email proporcionado
   * @param email - Email a verificar
   * @returns Result con true si existe, false si no existe
   */
  async exists(email: UserEmail): Promise<Result<boolean>> {
    try {
      const count = await this._userModel.countDocuments({ email: email.value }).exec();
      return Result.success(count > 0);
    } catch (error) {
      return Result.fail(
        ErrorType.INFRASTRUCTURE,
        `Error al verificar existencia de usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        {
          code: 'DB_QUERY_ERROR',
          source: 'mongo-user.repository',
          metadata: { email: email.value },
        },
      );
    }
  }
}
