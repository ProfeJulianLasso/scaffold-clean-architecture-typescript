import {
  ErrorType,
  ResultException,
} from '@common/exceptions/result.exception';

/**
 * Tipo de errores específicos del contexto de seguridad
 */
export enum SecurityErrorType {
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_IN_USE = 'EMAIL_ALREADY_IN_USE',
  PASSWORD_TOO_WEAK = 'PASSWORD_TOO_WEAK',
}

/**
 * Fábrica de excepciones específicas para el contexto de seguridad
 */
export const securityException = {
  userAlreadyExists(email: string): ResultException {
    return new ResultException(
      ErrorType.CONFLICT,
      `Ya existe un usuario con el email ${email}`,
      {
        code: SecurityErrorType.USER_ALREADY_EXISTS,
        source: 'security-domain',
        metadata: { email },
      },
    );
  },

  invalidCredentials(): ResultException {
    return new ResultException(
      ErrorType.UNAUTHORIZED,
      'Las credenciales proporcionadas no son válidas',
      {
        code: SecurityErrorType.INVALID_CREDENTIALS,
        source: 'security-domain',
      },
    );
  },

  emailAlreadyInUse(email: string): ResultException {
    return new ResultException(
      ErrorType.CONFLICT,
      `El email ${email} ya está en uso`,
      {
        code: SecurityErrorType.EMAIL_ALREADY_IN_USE,
        source: 'security-domain',
        metadata: { email },
      },
    );
  },

  passwordTooWeak(): ResultException {
    return new ResultException(
      ErrorType.VALIDATION,
      'La contraseña no cumple con los requisitos mínimos de seguridad',
      {
        code: SecurityErrorType.PASSWORD_TOO_WEAK,
        source: 'security-domain',
      },
    );
  },
};
