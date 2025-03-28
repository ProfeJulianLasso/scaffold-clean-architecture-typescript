import { User } from './entities/user.entity';
import { UserAggregate } from './user.aggregate';
import { UserActive } from './value-objects/user-active.value-object';
import { UserEmail } from './value-objects/user-email.value-object';
import { UserID } from './value-objects/user-id.value-object';
import { UserName } from './value-objects/user-name.value-object';
import { UserPassword } from './value-objects/user-password.value-object';

/**
 * Interfaz para la creación de un usuario
 * @interface CreateUserParams
 */
export interface CreateUserParams {
  /** Identificador opcional del usuario */
  id?: string;
  /** Nombre del usuario */
  name: string;
  /** Email del usuario */
  email: string;
  /** Contraseña del usuario (texto plano) */
  password: string;
  /** Estado de activación opcional (por defecto: true) */
  active?: boolean;
}

/**
 * Interfaz para la reconstitución de un usuario desde persistencia
 * @interface ReconstitutedUserParams
 */
export interface ReconstitutedUserParams {
  /** Identificador del usuario */
  id: string;
  /** Nombre del usuario */
  name: string;
  /** Email del usuario */
  email: string;
  /** Contraseña hasheada del usuario */
  hashedPassword: string;
  /** Estado de activación */
  active: boolean;
}

/**
 * Factory para la creación de usuarios
 *
 * Encapsula la lógica de creación de instancias válidas de Usuario y UserAggregate.
 * @module userFactory
 */
export const userFactory = {
  /**
   * Crea un nuevo agregado de usuario a partir de datos primitivos
   * @param params - Parámetros para la creación del usuario
   * @returns Promise con el agregado de usuario creado
   */
  async createAggregate(params: CreateUserParams): Promise<UserAggregate> {
    // Construir los value objects
    const userId = params.id ? new UserID(params.id) : new UserID();
    const userName = new UserName(params.name);
    const userEmail = new UserEmail(params.email);
    const userPassword = new UserPassword(params.password);
    const userActive =
      params.active !== undefined
        ? new UserActive(params.active)
        : new UserActive(true);

    // Crear la entidad de usuario
    const user = await User.create(
      userId,
      userName,
      userEmail,
      userPassword,
      userActive,
    );

    // Crear y devolver el agregado
    return new UserAggregate(user);
  },

  /**
   * Reconstruye un agregado de usuario a partir de datos persistidos
   * @param data - Datos recuperados de la persistencia
   * @returns Agregado de usuario reconstruido
   */
  reconstituteAggregate(data: ReconstitutedUserParams): UserAggregate {
    // Construir los value objects para la reconstitución
    const userId = new UserID(data.id);
    const userName = new UserName(data.name);
    const userEmail = new UserEmail(data.email);
    const userPassword = new UserPassword(data.hashedPassword, {
      isHashed: true,
    });
    const userActive = new UserActive(data.active);

    // Crear la entidad de usuario sin eventos (reconstitución)
    const user = User.reconstitute(
      userId,
      userName,
      userEmail,
      userPassword,
      userActive,
    );

    // Crear y devolver el agregado
    return new UserAggregate(user);
  },
};
