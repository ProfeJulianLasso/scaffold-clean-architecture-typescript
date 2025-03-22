import { ErrorType, IErrorDetails, ResultException } from './result.exception';

/**
 * Pruebas unitarias para la clase ResultException
 * Estas pruebas verifican el comportamiento de la clase de excepciones
 * siguiendo el patrón AAA (Arrange-Act-Assert)
 */
describe('ResultException', () => {
  // Pruebas del constructor
  describe('constructor', () => {
    it('debería crear una instancia con parámetros mínimos', () => {
      // Arrange (Preparar)
      const errorType = ErrorType.VALIDATION;
      const errorMessage = 'Entrada inválida';
      const expectedType = ErrorType.VALIDATION;
      const expectedMessage = 'Entrada inválida';
      const expectedStatusCode = 400;
      const expectedIsOperational = true;

      // Act (Actuar)
      const exception = new ResultException(errorType, errorMessage);

      // Assert (Verificar)
      expect(exception).toBeInstanceOf(Error);
      expect(exception).toBeInstanceOf(ResultException);
      expect(exception.type).toBe(expectedType);
      expect(exception.message).toBe(expectedMessage);
      expect(exception.statusCode).toBe(expectedStatusCode);
      expect(exception.isOperational).toBe(expectedIsOperational);
      expect(exception.details.code).toBe(expectedType);
      expect(exception.details.source).toBe('unknown');
      expect(exception.details.timestamp).toBeInstanceOf(Date);
    });

    it('debería crear una instancia con todas las opciones personalizadas', () => {
      // Arrange (Preparar)
      const errorType = ErrorType.NOT_FOUND;
      const errorMessage = 'Recurso no encontrado';
      const options = {
        code: 'CUSTOM_CODE',
        statusCode: 418,
        source: 'componente-prueba',
        metadata: { id: '123' },
        isOperational: false,
        stack: 'traza de pila personalizada',
      };
      const expectedType = ErrorType.NOT_FOUND;
      const expectedMessage = 'Recurso no encontrado';
      const expectedCode = 'CUSTOM_CODE';
      const expectedStatusCode = 418;
      const expectedSource = 'componente-prueba';
      const expectedMetadata = { id: '123' };
      const expectedIsOperational = false;
      const expectedStack = 'traza de pila personalizada';

      // Act (Actuar)
      const exception = new ResultException(errorType, errorMessage, options);

      // Assert (Verificar)
      expect(exception.type).toBe(expectedType);
      expect(exception.message).toBe(expectedMessage);
      expect(exception.statusCode).toBe(expectedStatusCode);
      expect(exception.isOperational).toBe(expectedIsOperational);
      expect(exception.details.code).toBe(expectedCode);
      expect(exception.details.source).toBe(expectedSource);
      expect(exception.details.metadata).toEqual(expectedMetadata);
      expect(exception.details.stack).toBe(expectedStack);
    });

    it('debería configurar correctamente el nombre y la herencia', () => {
      // Arrange (Preparar)
      const errorType = ErrorType.VALIDATION;
      const errorMessage = 'Error de prueba';
      const expectedName = 'ResultException';

      // Act (Actuar)
      const exception = new ResultException(errorType, errorMessage);

      // Assert (Verificar)
      expect(exception.name).toBe(expectedName);
      expect(Object.getPrototypeOf(exception)).toBe(ResultException.prototype);
      expect(exception instanceof Error).toBe(true);
    });
  });

  // Pruebas del método resolveStatusCode (privado, probado a través del constructor)
  describe('resolveStatusCode', () => {
    it('debería mapear cada tipo de error al código de estado HTTP correcto', () => {
      // Arrange (Preparar)
      const errorTypes = Object.values(ErrorType);
      const statusCodeMap: Record<ErrorType, number> = {
        [ErrorType.VALIDATION]: 400,
        [ErrorType.NOT_FOUND]: 404,
        [ErrorType.CONFLICT]: 409,
        [ErrorType.UNAUTHORIZED]: 401,
        [ErrorType.FORBIDDEN]: 403,
        [ErrorType.INTERNAL]: 500,
        [ErrorType.DOMAIN]: 422,
        [ErrorType.APPLICATION]: 500,
        [ErrorType.INFRASTRUCTURE]: 500,
      };

      errorTypes.forEach(type => {
        // Arrange (Preparar)
        const expectedCode = statusCodeMap[type];

        // Act (Actuar)
        const testError = new ResultException(type, 'Mensaje de prueba');

        // Assert (Verificar)
        expect(testError.statusCode).toBe(expectedCode);
      });
    });

    it('debería permitir anular el código de estado predeterminado', () => {
      // Arrange (Preparar)
      const errorType = ErrorType.VALIDATION;
      const customStatusCode = 422;

      // Act (Actuar)
      const exception = new ResultException(errorType, 'Mensaje', {
        statusCode: customStatusCode,
      });

      // Assert (Verificar)
      expect(exception.statusCode).toBe(customStatusCode);
      expect(exception.statusCode).not.toBe(400); // No debería ser el código predeterminado
    });
  });

  // Pruebas del método toJSON
  describe('toJSON', () => {
    let originalEnv: string | undefined;

    beforeEach(() => {
      originalEnv = process.env.NODE_ENV;
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('debería incluir la traza de pila cuando no está en producción', () => {
      // Arrange (Preparar)
      process.env.NODE_ENV = 'development';
      const exception = new ResultException(
        ErrorType.INTERNAL,
        'Error de prueba',
      );
      const expectedProperties = [
        'code',
        'message',
        'source',
        'timestamp',
        'metadata',
        'stack',
      ];

      // Act (Actuar)
      const jsonResult: IErrorDetails = exception.toJSON();

      // Assert (Verificar)
      expectedProperties.forEach(prop => {
        expect(jsonResult).toHaveProperty(prop);
      });
      expect(jsonResult.stack).toBeDefined();
    });

    it('debería omitir la traza de pila cuando está en producción', () => {
      // Arrange (Preparar)
      process.env.NODE_ENV = 'production';
      const exception = new ResultException(
        ErrorType.INTERNAL,
        'Error de prueba',
      );
      const expectedStack = undefined;

      // Act (Actuar)
      const jsonResult: IErrorDetails = exception.toJSON();

      // Assert (Verificar)
      expect(jsonResult.stack).toBe(expectedStack);
    });

    it('debería serializar correctamente todos los campos', () => {
      // Arrange (Preparar)
      process.env.NODE_ENV = 'development';
      const metadata = { userId: 123, action: 'delete' };
      const exception = new ResultException(
        ErrorType.FORBIDDEN,
        'Acceso denegado',
        {
          code: 'ACCESS_DENIED',
          source: 'auth-service',
          metadata,
        },
      );
      const expectedCode = 'ACCESS_DENIED';
      const expectedMessage = 'Acceso denegado';
      const expectedSource = 'auth-service';
      const expectedMetadata = metadata;

      // Act (Actuar)
      const jsonResult: IErrorDetails = exception.toJSON();

      // Assert (Verificar)
      expect(jsonResult.code).toBe(expectedCode);
      expect(jsonResult.message).toBe(expectedMessage);
      expect(jsonResult.source).toBe(expectedSource);
      expect(jsonResult.metadata).toEqual(expectedMetadata);
      expect(jsonResult.timestamp).toBeInstanceOf(Date);
    });
  });

  // Pruebas del método estático fromError
  describe('fromError', () => {
    it('debería convertir un Error estándar en ResultException con tipo por defecto', () => {
      // Arrange (Preparar)
      const originalError = new Error('Error estándar');
      const expectedType = ErrorType.INTERNAL;
      const expectedMessage = 'Error estándar';
      const expectedStatusCode = 500;

      // Act (Actuar)
      const exception = ResultException.fromError(originalError);

      // Assert (Verificar)
      expect(exception).toBeInstanceOf(ResultException);
      expect(exception.type).toBe(expectedType);
      expect(exception.message).toBe(expectedMessage);
      expect(exception.statusCode).toBe(expectedStatusCode);
      expect(exception.details.metadata).toEqual({ originalError: 'Error' });
      expect(exception.details.stack).toBe(originalError.stack);
    });

    it('debería convertir Error con tipo personalizado', () => {
      // Arrange (Preparar)
      const originalError = new Error('Error de dominio');
      const customType = ErrorType.DOMAIN;
      const expectedType = ErrorType.DOMAIN;
      const expectedStatusCode = 422;

      // Act (Actuar)
      const exception = ResultException.fromError(originalError, customType);

      // Assert (Verificar)
      expect(exception.type).toBe(expectedType);
      expect(exception.statusCode).toBe(expectedStatusCode);
    });

    it('debería devolver una ResultException existente sin modificarla', () => {
      // Arrange (Preparar)
      const errorType = ErrorType.INTERNAL;
      const originalException = new ResultException(
        ErrorType.VALIDATION,
        'Excepción original',
        {
          statusCode: 400,
          metadata: { key: 'value' },
        },
      );
      const expectedType = ErrorType.VALIDATION; // Debería mantener el tipo original
      const expectedMessage = 'Excepción original';
      const expectedMetadata = { key: 'value' };

      // Act (Actuar)
      const resultException = ResultException.fromError(
        originalException,
        errorType,
      );

      // Assert (Verificar)
      expect(resultException).toBe(originalException); // Debería ser el mismo objeto (referencia)
      expect(resultException.type).toBe(expectedType);
      expect(resultException.message).toBe(expectedMessage);
      expect(resultException.details.metadata).toEqual(expectedMetadata);
    });

    it('debería mantener la traza de pila del error original', () => {
      // Arrange (Preparar)
      const originalError = new Error('Error con stack');
      const originalStack = originalError.stack;
      const expectedStack = originalStack;

      // Act (Actuar)
      const exception = ResultException.fromError(originalError);

      // Assert (Verificar)
      expect(exception.details.stack).toBe(expectedStack);
    });
  });

  // Casos de borde y esquina
  describe('Casos de borde y esquina', () => {
    it('debería manejar mensajes vacíos', () => {
      // Arrange (Preparar)
      const errorType = ErrorType.VALIDATION;
      const errorMessage = '';
      const expectedMessage = '';

      // Act (Actuar)
      const exception = new ResultException(errorType, errorMessage);

      // Assert (Verificar)
      expect(exception.message).toBe(expectedMessage);
      expect(exception.details.message).toBe(expectedMessage);
    });

    it('debería manejar valores null o undefined en metadata', () => {
      // Arrange (Preparar)
      const errorType = ErrorType.DOMAIN;
      const errorMessage = 'Error de prueba';
      const metadata = {
        nullValue: null,
        undefinedValue: undefined,
        validValue: 'test',
      };
      const expectedMetadata = {
        nullValue: null,
        undefinedValue: undefined,
        validValue: 'test',
      };

      // Act (Actuar)
      const exception = new ResultException(errorType, errorMessage, {
        metadata,
      });

      // Assert (Verificar)
      expect(exception.details.metadata).toEqual(expectedMetadata);
    });

    it('debería establecer una marca de tiempo cercana a la hora actual', () => {
      // Arrange (Preparar)
      const errorType = ErrorType.VALIDATION;
      const errorMessage = 'Error de prueba';
      const before = new Date();

      // Act (Actuar)
      const exception = new ResultException(errorType, errorMessage);
      const after = new Date();

      // Assert (Verificar)
      const timestamp = exception.details.timestamp as Date;
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('debería usar "unknown" como source por defecto cuando no se especifica', () => {
      // Arrange (Preparar)
      const errorType = ErrorType.APPLICATION;
      const errorMessage = 'Error de prueba';
      const expectedSource = 'unknown';

      // Act (Actuar)
      const exception = new ResultException(errorType, errorMessage);

      // Assert (Verificar)
      expect(exception.details.source).toBe(expectedSource);
    });
  });
});
