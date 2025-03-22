import { ErrorType, ResultException } from '../../exceptions/result.exception';
import { Result } from './result.pattern';

/**
 * Pruebas unitarias para la clase Result
 * Estas pruebas verifican el comportamiento del patrón Result
 * siguiendo el patrón AAA (Arrange-Act-Assert)
 */
describe('Result', () => {
  // Pruebas de los métodos estáticos de creación
  describe('métodos de creación', () => {
    describe('success', () => {
      it('debería crear un resultado exitoso con un valor', () => {
        // Arrange (Preparar)
        const value = { id: 1, name: 'test' };
        const expectedValue = value;

        // Act (Actuar)
        const result = Result.success(value);

        // Assert (Verificar)
        expect(result.isSuccess()).toBe(true);
        expect(result.isFailure()).toBe(false);
        expect(result.getValue()).toBe(expectedValue);
      });

      it('debería crear un resultado exitoso sin valor (undefined)', () => {
        // Arrange (Preparar)
        const expectedValue = undefined;

        // Act (Actuar)
        const result = Result.success();

        // Assert (Verificar)
        expect(result.isSuccess()).toBe(true);
        expect(result.getValue()).toBe(expectedValue);
      });
    });

    describe('failure', () => {
      it('debería crear un resultado fallido con una excepción', () => {
        // Arrange (Preparar)
        const error = new ResultException(
          ErrorType.VALIDATION,
          'Error de prueba',
        );
        const expectedError = error;

        // Act (Actuar)
        const result = Result.failure(error);

        // Assert (Verificar)
        expect(result.isSuccess()).toBe(false);
        expect(result.isFailure()).toBe(true);
        expect(result.getError()).toBe(expectedError);
      });
    });

    describe('fail', () => {
      it('debería crear un resultado fallido a partir de tipo de error y mensaje', () => {
        // Arrange (Preparar)
        const errorType = ErrorType.NOT_FOUND;
        const errorMessage = 'Recurso no encontrado';
        const expectedType = ErrorType.NOT_FOUND;
        const expectedMessage = 'Recurso no encontrado';

        // Act (Actuar)
        const result = Result.fail(errorType, errorMessage);

        // Assert (Verificar)
        expect(result.isSuccess()).toBe(false);
        expect(result.getError()).toBeInstanceOf(ResultException);
        expect(result.getError().type).toBe(expectedType);
        expect(result.getError().message).toBe(expectedMessage);
      });

      it('debería crear un resultado fallido con opciones adicionales', () => {
        // Arrange (Preparar)
        const errorType = ErrorType.CONFLICT;
        const errorMessage = 'Conflicto de datos';
        const options = {
          code: 'CUSTOM_CODE',
          source: 'test-component',
          metadata: { key: 'value' },
        };
        const expectedCode = 'CUSTOM_CODE';
        const expectedSource = 'test-component';
        const expectedMetadata = { key: 'value' };

        // Act (Actuar)
        const result = Result.fail(errorType, errorMessage, options);

        // Assert (Verificar)
        expect(result.isFailure()).toBe(true);
        expect(result.getError().details.code).toBe(expectedCode);
        expect(result.getError().details.source).toBe(expectedSource);
        expect(result.getError().details.metadata).toEqual(expectedMetadata);
      });
    });

    describe('try', () => {
      it('debería capturar un resultado exitoso de una función', () => {
        // Arrange (Preparar)
        const expectedValue = 42;
        const fn = (): number => expectedValue;

        // Act (Actuar)
        const result = Result.try(fn);

        // Assert (Verificar)
        expect(result.isSuccess()).toBe(true);
        expect(result.getValue()).toBe(expectedValue);
      });

      it('debería capturar un ResultException lanzado por una función', () => {
        // Arrange (Preparar)
        const error = new ResultException(
          ErrorType.VALIDATION,
          'Error de validación',
        );
        const fn = (): void => {
          throw error;
        };
        const expectedError = error;

        // Act (Actuar)
        const result = Result.try(fn);

        // Assert (Verificar)
        expect(result.isFailure()).toBe(true);
        expect(result.getError()).toBe(expectedError);
      });

      it('debería convertir un Error estándar en ResultException', () => {
        // Arrange (Preparar)
        const errorMessage = 'Error estándar';
        const fn = (): void => {
          throw new Error(errorMessage);
        };
        const expectedType = ErrorType.INTERNAL;
        const expectedMessage = errorMessage;

        // Act (Actuar)
        const result = Result.try(fn);

        // Assert (Verificar)
        expect(result.isFailure()).toBe(true);
        expect(result.getError()).toBeInstanceOf(ResultException);
        expect(result.getError().message).toBe(expectedMessage);
        expect(result.getError().type).toBe(expectedType);
      });

      it('debería convertir errores no estándar en ResultException', () => {
        // Arrange (Preparar)
        const errorString = 'error string';
        const fn = (): void => {
          // Simular un error no estándar
          // eslint-disable-next-line @typescript-eslint/only-throw-error
          throw errorString;
        };
        const expectedType = ErrorType.INTERNAL;

        // Act (Actuar)
        const result = Result.try(fn);

        // Assert (Verificar)
        expect(result.isFailure()).toBe(true);
        expect(result.getError()).toBeInstanceOf(ResultException);
        expect(result.getError().type).toBe(expectedType);
        expect(result.getError().details.metadata).toHaveProperty(
          'originalError',
        );
      });
    });
  });

  // Pruebas de métodos de acceso
  describe('métodos de acceso', () => {
    describe('getValue', () => {
      it('debería obtener el valor de un resultado exitoso', () => {
        // Arrange (Preparar)
        const value = 'test value';
        const result = Result.success(value);
        const expectedValue = value;

        // Act (Actuar)
        const retrievedValue = result.getValue();

        // Assert (Verificar)
        expect(retrievedValue).toBe(expectedValue);
      });

      it('debería lanzar un error al intentar obtener el valor de un resultado fallido', () => {
        // Arrange (Preparar)
        const error = new ResultException(ErrorType.VALIDATION, 'Error');
        const result = Result.failure(error);
        const expectedErrorMessage =
          'No se puede obtener el valor de un resultado fallido';

        // Act & Assert (Actuar y Verificar)
        expect((): unknown => result.getValue()).toThrow(expectedErrorMessage);
      });
    });

    describe('getError', () => {
      it('debería obtener el error de un resultado fallido', () => {
        // Arrange (Preparar)
        const error = new ResultException(ErrorType.DOMAIN, 'Error de dominio');
        const result = Result.failure(error);
        const expectedError = error;

        // Act (Actuar)
        const retrievedError = result.getError();

        // Assert (Verificar)
        expect(retrievedError).toBe(expectedError);
      });

      it('debería lanzar un error al intentar obtener el error de un resultado exitoso', () => {
        // Arrange (Preparar)
        const result = Result.success('test');
        const expectedErrorMessage =
          'No se puede obtener el error de un resultado exitoso';

        // Act & Assert (Actuar y Verificar)
        expect((): ResultException => result.getError()).toThrow(
          expectedErrorMessage,
        );
      });
    });
  });

  // Pruebas de métodos de transformación
  describe('métodos de transformación', () => {
    describe('map', () => {
      it('debería transformar el valor de un resultado exitoso', () => {
        // Arrange (Preparar)
        const initialValue = 10;
        const transform = (x: number): number => x * 2;
        const expectedValue = 20;
        const result = Result.success(initialValue);

        // Act (Actuar)
        const mappedResult = result.map(transform);

        // Assert (Verificar)
        expect(mappedResult.isSuccess()).toBe(true);
        expect(mappedResult.getValue()).toBe(expectedValue);
      });

      it('debería propagar el error sin cambios para un resultado fallido', () => {
        // Arrange (Preparar)
        const error = new ResultException(ErrorType.NOT_FOUND, 'No encontrado');
        const result = Result.failure<number>(error);
        const transform = (x: number): number => x * 2;
        const expectedError = error;

        // Act (Actuar)
        const mappedResult = result.map(transform);

        // Assert (Verificar)
        expect(mappedResult.isFailure()).toBe(true);
        expect(mappedResult.getError()).toBe(expectedError);
      });

      it('debería capturar excepciones lanzadas en la función de transformación', () => {
        // Arrange (Preparar)
        const result = Result.success(5);
        const errorMessage = 'Error en transformación';
        const transform = (): void => {
          throw new Error(errorMessage);
        };
        const expectedMessage = errorMessage;

        // Act (Actuar)
        const mappedResult = result.map(transform);

        // Assert (Verificar)
        expect(mappedResult.isFailure()).toBe(true);
        expect(mappedResult.getError().message).toBe(expectedMessage);
      });

      it('debería capturar excepciones ResultException en la función de transformación', () => {
        // Arrange (Preparar)
        const result = Result.success(5);
        const error = new ResultException(
          ErrorType.VALIDATION,
          'Error de validación',
        );
        const transform = (): void => {
          throw error;
        };
        const expectedError = error;

        // Act (Actuar)
        const mappedResult = result.map(transform);

        // Assert (Verificar)
        expect(mappedResult.isFailure()).toBe(true);
        expect(mappedResult.getError()).toBe(expectedError);
      });
    });

    describe('flatMap', () => {
      it('debería encadenar resultados exitosos', () => {
        // Arrange (Preparar)
        const initialValue = 10;
        const chain = (x: number): Result<number> => Result.success(x * 2);
        const expectedValue = 20;
        const result = Result.success(initialValue);

        // Act (Actuar)
        const chainedResult = result.flatMap(chain);

        // Assert (Verificar)
        expect(chainedResult.isSuccess()).toBe(true);
        expect(chainedResult.getValue()).toBe(expectedValue);
      });

      it('debería propagar el error para un resultado inicial fallido', () => {
        // Arrange (Preparar)
        const error = new ResultException(
          ErrorType.UNAUTHORIZED,
          'No autorizado',
        );
        const result = Result.failure<number>(error);
        const chain = (x: number): Result<number> => Result.success(x * 2);
        const expectedError = error;

        // Act (Actuar)
        const chainedResult = result.flatMap(chain);

        // Assert (Verificar)
        expect(chainedResult.isFailure()).toBe(true);
        expect(chainedResult.getError()).toBe(expectedError);
      });

      it('debería propagar el error de la función de encadenamiento', () => {
        // Arrange (Preparar)
        const result = Result.success(5);
        const error = new ResultException(ErrorType.DOMAIN, 'Error de dominio');
        const chain = (): Result<number> => Result.failure<number>(error);
        const expectedError = error;

        // Act (Actuar)
        const chainedResult = result.flatMap(chain);

        // Assert (Verificar)
        expect(chainedResult.isFailure()).toBe(true);
        expect(chainedResult.getError()).toBe(expectedError);
      });

      it('debería capturar excepciones lanzadas en la función de encadenamiento', () => {
        // Arrange (Preparar)
        const result = Result.success(5);
        const errorMessage = 'Error en encadenamiento';
        const chain = (): Result<number> => {
          throw new Error(errorMessage);
        };
        const expectedMessage = errorMessage;

        // Act (Actuar)
        const chainedResult = result.flatMap(chain);

        // Assert (Verificar)
        expect(chainedResult.isFailure()).toBe(true);
        expect(chainedResult.getError().message).toBe(expectedMessage);
      });
    });
  });

  // Pruebas de métodos de manejo
  describe('métodos de manejo', () => {
    describe('fold', () => {
      it('debería aplicar la función onSuccess para un resultado exitoso', () => {
        // Arrange (Preparar)
        const value = 42;
        const result = Result.success(value);
        const onSuccess = (x: number): string => `Success: ${x}`;
        const onFailure = (): string => 'Failure';
        const expectedOutput = 'Success: 42';

        // Act (Actuar)
        const output = result.fold(onSuccess, onFailure);

        // Assert (Verificar)
        expect(output).toBe(expectedOutput);
      });

      it('debería aplicar la función onFailure para un resultado fallido', () => {
        // Arrange (Preparar)
        const error = new ResultException(
          ErrorType.VALIDATION,
          'Error de validación',
        );
        const result = Result.failure<number>(error);
        const onSuccess = (x: number): string => `Success: ${x}`;
        const onFailure = (e: ResultException): string =>
          `Failure: ${e.message}`;
        const expectedOutput = 'Failure: Error de validación';

        // Act (Actuar)
        const output = result.fold(onSuccess, onFailure);

        // Assert (Verificar)
        expect(output).toBe(expectedOutput);
      });
    });

    describe('recover', () => {
      it('debería devolver el mismo resultado si es exitoso', () => {
        // Arrange (Preparar)
        const value = 'test value';
        const result = Result.success(value);
        const recovery = (): Result<string> => Result.success('recovered');
        const expectedResult = result;
        const expectedValue = value;

        // Act (Actuar)
        const recoveredResult = result.recover(recovery);

        // Assert (Verificar)
        expect(recoveredResult).toBe(expectedResult);
        expect(recoveredResult.getValue()).toBe(expectedValue);
      });

      it('debería recuperar un resultado fallido usando la función de recuperación', () => {
        // Arrange (Preparar)
        const error = new ResultException(ErrorType.NOT_FOUND, 'No encontrado');
        const result = Result.failure<string>(error);
        const recoveryValue = 'valor por defecto';
        const recovery = (): Result<string> => Result.success(recoveryValue);
        const expectedValue = recoveryValue;

        // Act (Actuar)
        const recoveredResult = result.recover(recovery);

        // Assert (Verificar)
        expect(recoveredResult.isSuccess()).toBe(true);
        expect(recoveredResult.getValue()).toBe(expectedValue);
      });

      it('debería propagar el error de la función de recuperación', () => {
        // Arrange (Preparar)
        const initialError = new ResultException(
          ErrorType.VALIDATION,
          'Error inicial',
        );
        const result = Result.failure<string>(initialError);
        const recoveryError = new ResultException(
          ErrorType.DOMAIN,
          'Error de recuperación',
        );
        const recovery = (): Result<string> =>
          Result.failure<string>(recoveryError);
        const expectedError = recoveryError;

        // Act (Actuar)
        const recoveredResult = result.recover(recovery);

        // Assert (Verificar)
        expect(recoveredResult.isFailure()).toBe(true);
        expect(recoveredResult.getError()).toBe(expectedError);
      });

      it('debería capturar excepciones lanzadas en la función de recuperación', () => {
        // Arrange (Preparar)
        const initialError = new ResultException(
          ErrorType.VALIDATION,
          'Error inicial',
        );
        const result = Result.failure<string>(initialError);
        const errorMessage = 'Error en recuperación';
        const recovery = (): Result<string> => {
          throw new Error(errorMessage);
        };
        const expectedMessage = errorMessage;

        // Act (Actuar)
        const recoveredResult = result.recover(recovery);

        // Assert (Verificar)
        expect(recoveredResult.isFailure()).toBe(true);
        expect(recoveredResult.getError().message).toBe(expectedMessage);
      });
    });

    describe('onSuccess', () => {
      it('debería ejecutar la acción para un resultado exitoso', () => {
        // Arrange (Preparar)
        const value = 'test value';
        const result = Result.success(value);
        let sideEffect = '';
        const action = (v: string): void => {
          sideEffect = v;
        };
        const expectedSideEffect = value;
        const expectedResult = result;

        // Act (Actuar)
        const returnedResult = result.onSuccess(action);

        // Assert (Verificar)
        expect(sideEffect).toBe(expectedSideEffect);
        expect(returnedResult).toBe(expectedResult);
      });

      it('no debería ejecutar la acción para un resultado fallido', () => {
        // Arrange (Preparar)
        const error = new ResultException(ErrorType.VALIDATION, 'Error');
        const result = Result.failure<string>(error);
        let sideEffect = '';
        const action = (v: string): void => {
          sideEffect = v;
        };
        const expectedSideEffect = '';
        const expectedResult = result;

        // Act (Actuar)
        const returnedResult = result.onSuccess(action);

        // Assert (Verificar)
        expect(sideEffect).toBe(expectedSideEffect);
        expect(returnedResult).toBe(expectedResult);
      });

      it('debería ignorar errores lanzados en la acción y mantener el flujo', () => {
        // Arrange (Preparar)
        const value = 'test value';
        const result = Result.success(value);
        const action = (): void => {
          throw new Error('Error en acción');
        };
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        const expectedResult = result;

        // Act (Actuar)
        const returnedResult = result.onSuccess(action);

        // Assert (Verificar)
        expect(returnedResult).toBe(expectedResult);
        expect(consoleSpy).toHaveBeenCalled();

        // Cleanup
        consoleSpy.mockRestore();
      });
    });

    describe('onFailure', () => {
      it('debería ejecutar la acción para un resultado fallido', () => {
        // Arrange (Preparar)
        const error = new ResultException(ErrorType.NOT_FOUND, 'No encontrado');
        const result = Result.failure<string>(error);
        let sideEffect: ResultException | null = null;
        const action = (e: ResultException): void => {
          sideEffect = e;
        };
        const expectedSideEffect = error;
        const expectedResult = result;

        // Act (Actuar)
        const returnedResult = result.onFailure(action);

        // Assert (Verificar)
        expect(sideEffect).toBe(expectedSideEffect);
        expect(returnedResult).toBe(expectedResult);
      });

      it('no debería ejecutar la acción para un resultado exitoso', () => {
        // Arrange (Preparar)
        const result = Result.success('test');
        let sideEffect = false;
        const action = (): void => {
          sideEffect = true;
        };
        const expectedSideEffect = false;
        const expectedResult = result;

        // Act (Actuar)
        const returnedResult = result.onFailure(action);

        // Assert (Verificar)
        expect(sideEffect).toBe(expectedSideEffect);
        expect(returnedResult).toBe(expectedResult);
      });

      it('debería ignorar errores lanzados en la acción y mantener el flujo', () => {
        // Arrange (Preparar)
        const error = new ResultException(ErrorType.VALIDATION, 'Error');
        const result = Result.failure<string>(error);
        const action = (): void => {
          throw new Error('Error en acción');
        };
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        const expectedResult = result;

        // Act (Actuar)
        const returnedResult = result.onFailure(action);

        // Assert (Verificar)
        expect(returnedResult).toBe(expectedResult);
        expect(consoleSpy).toHaveBeenCalled();

        // Cleanup
        consoleSpy.mockRestore();
      });
    });
  });

  // Pruebas de métodos de desenvoltura
  describe('métodos de desenvoltura', () => {
    describe('unwrap', () => {
      it('debería devolver el valor para un resultado exitoso', () => {
        // Arrange (Preparar)
        const value = 'test value';
        const result = Result.success(value);
        const expectedValue = value;

        // Act (Actuar)
        const unwrappedValue = result.unwrap();

        // Assert (Verificar)
        expect(unwrappedValue).toBe(expectedValue);
      });

      it('debería lanzar la excepción para un resultado fallido', () => {
        // Arrange (Preparar)
        const error = new ResultException(
          ErrorType.VALIDATION,
          'Error de validación',
        );
        const result = Result.failure<string>(error);
        const expectedError = error;

        // Act & Assert (Actuar y Verificar)
        expect((): string => result.unwrap()).toThrow(expectedError);
      });
    });

    describe('unwrapOr', () => {
      it('debería devolver el valor para un resultado exitoso', () => {
        // Arrange (Preparar)
        const value = 'test value';
        const result = Result.success(value);
        const defaultValue = 'default value';
        const expectedValue = value;

        // Act (Actuar)
        const unwrappedValue = result.unwrapOr(defaultValue);

        // Assert (Verificar)
        expect(unwrappedValue).toBe(expectedValue);
      });

      it('debería devolver el valor por defecto para un resultado fallido', () => {
        // Arrange (Preparar)
        const error = new ResultException(ErrorType.NOT_FOUND, 'No encontrado');
        const result = Result.failure<string>(error);
        const defaultValue = 'default value';
        const expectedValue = defaultValue;

        // Act (Actuar)
        const unwrappedValue = result.unwrapOr(defaultValue);

        // Assert (Verificar)
        expect(unwrappedValue).toBe(expectedValue);
      });
    });
  });

  // Pruebas de métodos de combinación
  describe('métodos de combinación', () => {
    describe('combine', () => {
      it('debería combinar múltiples resultados exitosos en un array', () => {
        // Arrange (Preparar)
        const results = [
          Result.success(1),
          Result.success(2),
          Result.success(3),
        ];
        const expectedValue = [1, 2, 3];

        // Act (Actuar)
        const combinedResult = Result.combine(results);

        // Assert (Verificar)
        expect(combinedResult.isSuccess()).toBe(true);
        expect(combinedResult.getValue()).toEqual(expectedValue);
      });

      it('debería devolver el primer resultado fallido encontrado', () => {
        // Arrange (Preparar)
        const error = new ResultException(ErrorType.VALIDATION, 'Error');
        const results = [
          Result.success(1),
          Result.failure<number>(error),
          Result.success(3),
        ];
        const expectedError = error;

        // Act (Actuar)
        const combinedResult = Result.combine(results);

        // Assert (Verificar)
        expect(combinedResult.isFailure()).toBe(true);
        expect(combinedResult.getError()).toBe(expectedError);
      });

      it('debería devolver un resultado exitoso con array vacío para una lista vacía', () => {
        // Arrange (Preparar)
        const results: Result<number>[] = [];
        const expectedValue: number[] = [];

        // Act (Actuar)
        const combinedResult = Result.combine(results);

        // Assert (Verificar)
        expect(combinedResult.isSuccess()).toBe(true);
        expect(combinedResult.getValue()).toEqual(expectedValue);
      });
    });
  });

  // Casos de borde y esquina
  describe('Casos de borde y esquina', () => {
    it('debería manejar valores null y undefined como valores válidos', () => {
      // Arrange (Preparar)
      const nullResult = Result.success(null);
      const undefinedResult = Result.success();
      const expectedNullValue = null;
      const expectedUndefinedValue = undefined;

      // Act & Assert (Actuar y Verificar)
      expect(nullResult.isSuccess()).toBe(true);
      expect(nullResult.getValue()).toBe(expectedNullValue);

      expect(undefinedResult.isSuccess()).toBe(true);
      expect(undefinedResult.getValue()).toBe(expectedUndefinedValue);
    });

    it('debería manejar objetos circulares sin entrar en bucle infinito', () => {
      // Arrange (Preparar)
      const circularObj: any = {};
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      circularObj.self = circularObj;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const expectedObj = circularObj;

      // Act (Actuar)
      const result = Result.success(circularObj);

      // Assert (Verificar)
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toBe(expectedObj);
      expect((result.getValue() as { self: any }).self).toBe(expectedObj);
    });

    it('debería manejar errores sin mensaje', () => {
      // Arrange (Preparar)
      const errorWithoutMessage = new Error();
      const fn = (): void => {
        throw errorWithoutMessage;
      };
      const expectedMessage = '';

      // Act (Actuar)
      const result = Result.try(fn);

      // Assert (Verificar)
      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toBe(expectedMessage);
    });

    it('debería propagar correctamente tipos genéricos a través de transformaciones', () => {
      // Arrange (Preparar)
      const userResult = Result.success<number>(1).map(id => ({
        id,
        name: `User ${id}`,
      }));
      const expectedUser = { id: 1, name: 'User 1' };

      // Act (Actuar)
      const user = userResult.getValue();

      // Assert (Verificar)
      expect(userResult.isSuccess()).toBe(true);
      expect(user).toEqual(expectedUser);
    });

    it('debería manejar encadenamiento de múltiples operaciones', () => {
      // Arrange (Preparar)
      const initialResult = Result.success(5);
      const expectedValue = 100;

      // Act (Actuar)
      const finalResult = initialResult
        .map(x => x * 2) // 10
        .flatMap(x => Result.success(x.toString())) // "10"
        .map(s => s + '0') // "100"
        .map(s => parseInt(s)); // 100

      // Assert (Verificar)
      expect(finalResult.isSuccess()).toBe(true);
      expect(finalResult.getValue()).toBe(expectedValue);
    });

    it('debería detener el encadenamiento en el primer error', () => {
      // Arrange (Preparar)
      const initialResult = Result.success(5);
      const error = new ResultException(ErrorType.VALIDATION, 'Error en medio');
      const expectedError = new ResultException(
        ErrorType.VALIDATION,
        'Error en medio',
      );

      // Act (Actuar)
      const finalResult = initialResult
        .map(x => x * 2) // 10
        .flatMap(() => Result.failure<number>(error)) // Falla aquí
        .map(x => x * 2); // No se ejecuta

      // Assert (Verificar)
      expect(finalResult.isFailure()).toBe(true);
      expect(finalResult.getError()).toStrictEqual(expectedError);
    });

    it('debería mantener la consistencia de tipos en transformaciones encadenadas', () => {
      // Arrange (Preparar)
      type StringOrNumber = string | number;
      const initialResult = Result.success<number>(42);
      const expectedValue = '42';

      // Act (Actuar)
      const stringResult = initialResult.map<StringOrNumber>(n => n.toString());

      // Assert (Verificar)
      expect(stringResult.isSuccess()).toBe(true);
      expect(typeof stringResult.getValue()).toBe('string');
      expect(stringResult.getValue()).toBe(expectedValue);
    });

    it('debería manejar operaciones asíncronas dentro de try', async () => {
      // Arrange (Preparar)
      const asyncFn = async (): Promise<string> =>
        Promise.resolve('async result');
      const syncFn = (): Promise<string> => asyncFn();
      const expectedType = 'object'; // Promise es un objeto

      // Act (Actuar)
      const result = Result.try(syncFn);

      // Assert (Verificar)
      expect(result.isSuccess()).toBe(true);
      expect(typeof result.getValue()).toBe(expectedType);
      expect(result.getValue()).toBeInstanceOf(Promise);
      expect(await result.getValue()).toBe('async result');
    });

    it('debería funcionar correctamente con valores primitivos y objetos', () => {
      // Arrange (Preparar)
      const numberResult = Result.success(42);
      const stringResult = Result.success('hello');
      const booleanResult = Result.success(true);
      const objectResult = Result.success({ key: 'value' });
      const arrayResult = Result.success([1, 2, 3]);
      const expectedNumber = 42;
      const expectedString = 'hello';
      const expectedBoolean = true;
      const expectedObject = { key: 'value' };
      const expectedArray = [1, 2, 3];

      // Act (Actuar)
      const numberValue = numberResult.getValue();
      const stringValue = stringResult.getValue();
      const booleanValue = booleanResult.getValue();
      const objectValue = objectResult.getValue();
      const arrayValue = arrayResult.getValue();

      // Assert (Verificar)
      expect(numberValue).toBe(expectedNumber);
      expect(stringValue).toBe(expectedString);
      expect(booleanValue).toBe(expectedBoolean);
      expect(objectValue).toEqual(expectedObject);
      expect(arrayValue).toEqual(expectedArray);
    });
  });
});
