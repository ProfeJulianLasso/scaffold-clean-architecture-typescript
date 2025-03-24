/**
 * @fileoverview Ejemplos prácticos de uso del patrón Result
 * Este archivo contiene ejemplos que demuestran cómo utilizar el patrón Result
 * para manejar resultados de operaciones y errores de manera elegante.
 */

import {
  ErrorType,
  ResultException,
} from '@common/exceptions/result.exception';
import { Result } from './result.pattern';

/**
 * 1. EJEMPLOS BÁSICOS
 * Demostración del uso básico de los métodos success y failure
 */
const basicExamples = {
  /**
   * Ejemplo de creación de resultados exitosos
   */
  successExample(): void {
    // Crear un resultado exitoso con un valor
    const numberResult = Result.success(42);
    console.log('Es exitoso:', numberResult.isSuccess()); // true
    console.log('Valor:', numberResult.getValue()); // 42

    // Crear un resultado exitoso con un objeto
    const userResult = Result.success({ id: 1, name: 'John Doe' });
    console.log('Usuario:', userResult.getValue()); // { id: 1, name: 'John Doe' }

    // Crear un resultado exitoso sin valor (undefined)
    const emptyResult = Result.success();
    console.log('Valor vacío:', emptyResult.getValue()); // undefined
  },

  /**
   * Ejemplo de creación de resultados fallidos
   */
  failureExample(): void {
    // Crear un resultado fallido con una excepción
    const error = new ResultException(
      ErrorType.VALIDATION,
      'El campo email no es válido',
    );
    const failedResult = Result.failure<string>(error);

    console.log('Es fallido:', failedResult.isFailure()); // true

    try {
      // Intentar obtener el valor de un resultado fallido lanzará una excepción
      failedResult.getValue();
    } catch (e) {
      console.log('Error al obtener valor:', (e as Error).message);
    }

    // Obtener el error de un resultado fallido
    const resultError = failedResult.getError();
    console.log('Tipo de error:', resultError.type); // VALIDATION
    console.log('Mensaje:', resultError.message); // El campo email no es válido
  },

  /**
   * Ejemplo de creación de resultados fallidos con el método fail
   */
  failShorthandExample(): void {
    // Crear un resultado fallido usando el método estático fail
    const notFoundResult = Result.fail<{ id: number; name: string }>(
      ErrorType.NOT_FOUND,
      'Usuario no encontrado',
      {
        code: 'USER_NOT_FOUND',
        source: 'user-service',
        metadata: { userId: '123' },
      },
    );

    const error = notFoundResult.getError();
    console.log('Código HTTP:', error.statusCode); // 404
    console.log('Detalles:', error.details); // { code: 'USER_NOT_FOUND', ... }
  },
};

/**
 * 2. EJEMPLOS DE TRANSFORMACIÓN Y ENCADENAMIENTO
 * Demostración del uso de map y flatMap para transformar resultados
 */
const transformationExamples = {
  /**
   * Ejemplo de uso del método map para transformar un valor
   */
  mapExample(): void {
    // Comenzar con un resultado exitoso
    const initialResult = Result.success(5);

    // Transformar el valor usando map
    const doubledResult = initialResult.map(value => value * 2);
    console.log('Valor duplicado:', doubledResult.getValue()); // 10

    // Encadenar múltiples transformaciones
    const finalResult = initialResult
      .map(value => value * 2) // 10
      .map(value => `El valor es: ${value}`) // "El valor es: 10"
      .map(text => text.toUpperCase()); // "EL VALOR ES: 10"

    console.log('Resultado final:', finalResult.getValue());
  },

  /**
   * Ejemplo de gestión de errores en transformaciones
   */
  mapErrorHandlingExample(): void {
    const result = Result.success(5);

    // Si la función de transformación lanza una excepción, se convierte en un resultado fallido
    const errorResult = result.map(value => {
      if (value < 10) {
        throw new ResultException(
          ErrorType.VALIDATION,
          'El valor debe ser mayor o igual a 10',
        );
      }
      return value * 2;
    });

    console.log('Es fallido:', errorResult.isFailure()); // true
    console.log('Mensaje de error:', errorResult.getError().message);
  },

  /**
   * Ejemplo de uso del método flatMap para encadenar operaciones que devuelven Result
   */
  flatMapExample(): void {
    // Una función que devuelve un Result
    const divide = (a: number, b: number): Result<number> => {
      if (b === 0) {
        return Result.fail(
          ErrorType.VALIDATION,
          'No se puede dividir por cero',
        );
      }
      return Result.success(a / b);
    };

    // Comenzamos con un resultado exitoso
    const initialResult = Result.success(10);

    // Usamos flatMap para encadenar operaciones que devuelven Result
    const divideByFive = initialResult.flatMap(value => divide(value, 5));
    console.log('10 / 5 =', divideByFive.getValue()); // 2

    // Encadenamiento de operaciones con posible error
    const divideByZero = initialResult.flatMap(value => divide(value, 0));
    console.log('Error al dividir por cero:', divideByZero.getError().message);

    // El encadenamiento se detiene en el primer error
    const chainedResult = initialResult
      .flatMap(value => divide(value, 5)) // Success: 2
      .flatMap(value => divide(value, 0)) // Failure: No se puede dividir por cero
      .flatMap(value => divide(value, 2)); // No se ejecuta

    console.log('Resultado encadenado fallido:', chainedResult.isFailure()); // true
  },
};

/**
 * 3. EJEMPLOS DE MANEJO DE ERRORES
 * Demostración de técnicas para manejar resultados fallidos
 */
const errorHandlingExamples = {
  /**
   * Ejemplo de uso del método fold para manejar ambos casos
   */
  foldExample(): void {
    // Función que puede devolver éxito o fracaso
    const parseAge = (input: string): Result<number> => {
      const age = Number.parseInt(input, 10);

      if (Number.isNaN(age)) {
        return Result.fail(
          ErrorType.VALIDATION,
          'La edad debe ser un número válido',
        );
      }

      if (age < 0 || age > 120) {
        return Result.fail(
          ErrorType.VALIDATION,
          'La edad debe estar entre 0 y 120',
        );
      }

      return Result.success(age);
    };

    // Casos de prueba
    const inputs = ['25', 'abc', '150'];

    for (const input of inputs) {
      const result = parseAge(input);

      // Usar fold para manejar ambos casos (éxito y fracaso)
      const message = result.fold(
        // Caso exitoso
        age => `Edad válida: ${age} años`,
        // Caso fallido
        error => `Error: ${error.message}`,
      );

      console.log(`Entrada "${input}": ${message}`);
    }
  },

  /**
   * Ejemplo de uso del método recover para manejar errores
   */
  recoverExample(): void {
    // Función que simula buscar un usuario por ID
    const findUserById = (id: string): Result<{ id: string; name: string }> => {
      // Simular que el usuario con ID "999" no existe
      if (id === '999') {
        return Result.fail(
          ErrorType.NOT_FOUND,
          `Usuario con ID ${id} no encontrado`,
        );
      }
      return Result.success({ id, name: `Usuario ${id}` });
    };

    // Intentar encontrar un usuario que no existe
    const userResult = findUserById('999');

    // Recuperar del error proporcionando un usuario por defecto
    const recoveredResult = userResult.recover(() =>
      Result.success({ id: 'default', name: 'Usuario Invitado' }),
    );

    console.log('Usuario recuperado:', recoveredResult.getValue());
  },

  /**
   * Ejemplo de uso de los métodos onSuccess y onFailure para efectos secundarios
   */
  sideEffectsExample(): void {
    // Simular una validación de email
    const validateEmail = (email: string): Result<string> => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return Result.fail(ErrorType.VALIDATION, 'Formato de email inválido');
      }
      return Result.success(email);
    };

    // Caso exitoso con efectos secundarios
    validateEmail('user@example.com')
      .onSuccess(email => {
        console.log(`Email válido: ${email}`);
        // Aquí podríamos enviar una notificación, actualizar UI, etc.
      })
      .onFailure(error => {
        console.error(`Error: ${error.message}`);
        // Esto no se ejecutará en este caso
      });

    // Caso fallido con efectos secundarios
    validateEmail('invalid-email')
      .onSuccess(email => {
        console.log(`Email válido: ${email}`);
        // Esto no se ejecutará en este caso
      })
      .onFailure(error => {
        console.error(`Error: ${error.message}`);
        // Aquí podríamos mostrar un mensaje de error, resaltar el campo, etc.
      });
  },

  /**
   * Ejemplo de uso de unwrap y unwrapOr
   */
  unwrapExample(): void {
    // Resultado exitoso
    const successResult = Result.success(42);

    // unwrap devuelve el valor directamente
    try {
      const value = successResult.unwrap();
      console.log('Valor unwrapped:', value); // 42
    } catch (error: unknown) {
      console.error('Este código no se ejecutará para resultados exitosos');
    }

    // Resultado fallido
    const failureResult = Result.fail<number>(
      ErrorType.VALIDATION,
      'Valor inválido',
    );

    // unwrap lanzará la excepción para resultados fallidos
    try {
      failureResult.unwrap();
    } catch (error) {
      console.error(
        'Error al hacer unwrap:',
        (error as ResultException).message,
      );
    }

    // unwrapOr devuelve un valor por defecto para resultados fallidos
    const defaultValue = failureResult.unwrapOr(0);
    console.log('Valor con unwrapOr:', defaultValue); // 0
  },
};

/**
 * 4. EJEMPLOS DE OPERACIONES TRY
 * Demostración del uso de try y tryAsync para capturar excepciones
 */
const tryExamples = {
  /**
   * Ejemplo de uso del método try para capturar excepciones
   */
  tryExample(): void {
    // Función que puede lanzar una excepción
    const parseJSON = (input: string): Result<unknown> => {
      return Result.try(() => {
        return JSON.parse(input);
      });
    };

    // Caso exitoso
    const validJSON = '{"name": "John", "age": 30}';
    const successResult = parseJSON(validJSON);
    console.log('Parseo exitoso:', successResult.getValue());

    // Caso fallido
    const invalidJSON = '{name: John}'; // JSON inválido
    const failureResult = parseJSON(invalidJSON);
    console.log('Error de parseo:', failureResult.getError().message);
  },

  /**
   * Ejemplo de uso del método tryAsync para operaciones asíncronas
   */
  async tryAsyncExample(): Promise<void> {
    // Función asíncrona que simula una petición HTTP
    const fetchUserData = async (userId: string): Promise<unknown> => {
      // Simular una petición HTTP que puede fallar
      if (userId === '404') {
        throw new Error('Usuario no encontrado');
      }

      if (userId === '500') {
        throw new Error('Error interno del servidor');
      }

      // Simular respuesta exitosa
      return Promise.resolve({
        id: userId,
        name: 'John Doe',
        email: 'john@example.com',
      });
    };

    // Envolver la operación asíncrona con tryAsync
    const result = await Result.tryAsync(() => fetchUserData('123'));

    if (result.isSuccess()) {
      console.log('Datos del usuario:', result.getValue());
    } else {
      console.error('Error:', result.getError().message);
    }

    // Caso con error conocido
    const notFoundResult = await Result.tryAsync(() => fetchUserData('404'));
    console.log('¿El resultado es fallido?', notFoundResult.isFailure());
    console.log('Mensaje de error:', notFoundResult.getError().message);

    // Personalizar el tipo de error según el error original
    const customMappingResult = await Result.tryAsync(
      () => fetchUserData('500'),
      error => {
        if (error instanceof Error && error.message.includes('interno')) {
          return ErrorType.INFRASTRUCTURE;
        }
        return ErrorType.APPLICATION;
      },
    );

    console.log(
      'Tipo de error personalizado:',
      customMappingResult.getError().type,
    );
  },
};

/**
 * 5. EJEMPLOS DE COMBINACIÓN DE RESULTADOS
 * Demostración de cómo combinar múltiples resultados
 */
const combinationExamples = {
  /**
   * Ejemplo de uso del método combine para procesar múltiples resultados
   */
  combineExample(): void {
    // Función que valida un campo
    const validateField = (
      name: string,
      value: string,
      required = false,
    ): Result<string> => {
      if (required && !value.trim()) {
        return Result.fail(
          ErrorType.VALIDATION,
          `El campo '${name}' es obligatorio`,
        );
      }
      return Result.success(value);
    };

    // Validar múltiples campos de un formulario
    const nameResult = validateField('nombre', 'John Doe', true);
    const emailResult = validateField('email', 'john@example.com', true);
    const phoneResult = validateField('teléfono', '', false); // Campo opcional

    // Combinar todos los resultados
    const combinedResult = Result.combine([
      nameResult,
      emailResult,
      phoneResult,
    ]);

    if (combinedResult.isSuccess()) {
      const [name, email, phone] = combinedResult.getValue();
      console.log('Formulario válido:', {
        name,
        email,
        phone: phone || 'No proporcionado',
      });
    } else {
      console.error('Error de validación:', combinedResult.getError().message);
    }

    // Ejemplo con un campo inválido
    const invalidEmailResult = validateField('email', '', true);
    const invalidCombinedResult = Result.combine([
      nameResult,
      invalidEmailResult,
      phoneResult,
    ]);

    console.log('¿Combinación inválida?', invalidCombinedResult.isFailure());
    console.log('Error:', invalidCombinedResult.getError().message);
  },

  /**
   * Ejemplo de procesamiento de múltiples operaciones asíncronas
   */
  async asyncCombineExample(): Promise<void> {
    // Simular operaciones asíncronas
    const fetchUserProfile = async (
      userId: string,
    ): Promise<Result<object>> => {
      try {
        // Simular petición HTTP
        if (userId === '404') {
          throw new Error('Usuario no encontrado');
        }
        return Promise.resolve(
          Result.success({ id: userId, name: 'John Doe' }),
        );
      } catch (error) {
        return Promise.resolve(
          Result.fail(ErrorType.NOT_FOUND, (error as Error).message),
        );
      }
    };

    const fetchUserOrders = async (
      userId: string,
    ): Promise<Result<object[]>> => {
      try {
        return Promise.resolve(
          Result.success([
            { id: 'order1', amount: 100 },
            { id: 'order2', amount: 200 },
          ]),
        );
      } catch (error) {
        return Promise.resolve(
          Result.fail(ErrorType.APPLICATION, (error as Error).message),
        );
      }
    };

    // Ejecutar operaciones en paralelo
    const userId = '123';
    const [profileResult, ordersResult] = await Promise.all([
      fetchUserProfile(userId),
      fetchUserOrders(userId),
    ]);

    // Combinar resultados
    const combinedResult = Result.combine([profileResult, ordersResult]);

    if (combinedResult.isSuccess()) {
      const [profile, orders] = combinedResult.getValue();
      console.log('Datos completos:', { profile, orders });
    } else {
      console.error(
        'Error al obtener datos:',
        combinedResult.getError().message,
      );
    }
  },
};

/**
 * 6. CASOS DE USO REALES
 * Ejemplos de uso del patrón Result en servicios y controladores
 */
const realWorldExamples = {
  /**
   * Ejemplo de un servicio de autenticación usando el patrón Result
   */
  userAuthenticationService(): void {
    interface User {
      id: string;
      email: string;
      password: string;
    }

    class AuthService {
      // Base de datos simulada
      private readonly users: User[] = [
        { id: '1', email: 'user@example.com', password: 'hashed_password' },
      ];

      /**
       * Método que intenta autenticar a un usuario
       */
      authenticate(email: string, password: string): Result<User> {
        // Validar entrada
        if (!email || !password) {
          return Result.fail(
            ErrorType.VALIDATION,
            'El email y la contraseña son obligatorios',
            { source: 'auth-service' },
          );
        }

        // Buscar usuario
        const user = this.users.find(u => u.email === email);

        if (!user) {
          return Result.fail(ErrorType.UNAUTHORIZED, 'Credenciales inválidas', {
            source: 'auth-service',
            code: 'INVALID_CREDENTIALS',
          });
        }

        // Verificar contraseña (simplificado)
        if (user.password !== password) {
          return Result.fail(ErrorType.UNAUTHORIZED, 'Credenciales inválidas', {
            source: 'auth-service',
            code: 'INVALID_CREDENTIALS',
          });
        }

        // Autenticación exitosa
        return Result.success(user);
      }

      /**
       * Método que genera un token JWT (simplificado)
       */
      generateToken(user: User): Result<string> {
        try {
          // Simulación de generación de token
          const token = `jwt_token_for_${user.id}`;
          return Result.success(token);
        } catch (error) {
          return Result.fail(
            ErrorType.APPLICATION,
            'Error al generar el token',
            {
              source: 'auth-service',
              metadata: { userId: user.id, error: String(error) },
            },
          );
        }
      }
    }

    // Uso del servicio
    const authService = new AuthService();

    // Flujo de autenticación usando encadenamiento fluido
    const loginResult = authService
      .authenticate('user@example.com', 'hashed_password')
      .flatMap(user => authService.generateToken(user));

    // Manejar el resultado
    if (loginResult.isSuccess()) {
      console.log('Login exitoso. Token:', loginResult.getValue());
    } else {
      const error = loginResult.getError();
      console.error(`Error (${error.type}): ${error.message}`);
    }
  },

  /**
   * Ejemplo de un controlador para gestión de usuarios
   */
  userController(): void {
    interface User {
      id: string;
      name: string;
      email: string;
    }

    class UserService {
      // Simulación de una base de datos
      private readonly users: User[] = [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
      ];

      /**
       * Busca un usuario por ID
       */
      findById(id: string): Result<User> {
        const user = this.users.find(u => u.id === id);

        if (!user) {
          return Result.fail(
            ErrorType.NOT_FOUND,
            `Usuario con ID ${id} no encontrado`,
            {
              code: 'USER_NOT_FOUND',
              source: 'user-service',
              metadata: { userId: id },
            },
          );
        }

        return Result.success(user);
      }

      /**
       * Crea un nuevo usuario
       */
      createUser(userData: Omit<User, 'id'>): Result<User> {
        // Validar que el email no exista
        const existingUser = this.users.find(u => u.email === userData.email);

        if (existingUser) {
          return Result.fail(
            ErrorType.CONFLICT,
            `Ya existe un usuario con el email ${userData.email}`,
            {
              code: 'EMAIL_ALREADY_EXISTS',
              source: 'user-service',
              metadata: { email: userData.email },
            },
          );
        }

        // Crear nuevo usuario
        const newUser: User = {
          id: Date.now().toString(),
          ...userData,
        };

        this.users.push(newUser);
        return Result.success(newUser);
      }
    }

    // Define interfaces claras para los dos tipos de respuesta
    interface ApiSuccessResponse {
      statusCode: number;
      body: {
        status: 'success';
        data: User;
      };
    }

    interface ApiErrorResponse {
      statusCode: number;
      body: {
        status: 'error';
        error: {
          code: string;
          message: string;
        };
      };
    }

    type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

    // Simulación de un controlador HTTP
    class UserController {
      constructor(private readonly _userService: UserService) {}

      /**
       * Maneja la petición para obtener un usuario
       */
      getUser(userId: string): ApiResponse {
        const result = this._userService.findById(userId);

        return result.fold<ApiResponse>(
          // Caso exitoso: devolver respuesta 200 con datos
          user => ({
            statusCode: 200,
            body: {
              status: 'success',
              data: user,
            },
          }),
          // Caso fallido: devolver código de error adecuado
          error => ({
            statusCode: error.statusCode,
            body: {
              status: 'error',
              error: {
                code: error.details.code,
                message: error.message,
              },
            },
          }),
        );
      }

      /**
       * Maneja la petición para crear un usuario
       */
      createUser(userData: { name: string; email: string }): ApiResponse {
        // Validación simple
        const validationResult = this.validateUserData(userData);

        if (validationResult.isFailure()) {
          const error = validationResult.getError();
          return {
            statusCode: error.statusCode,
            body: {
              status: 'error',
              error: {
                code: error.details.code,
                message: error.message,
              },
            },
          };
        }

        // Crear usuario
        const result = this._userService.createUser(userData);

        return result.fold<ApiResponse>(
          // Caso exitoso: respuesta 201 Created
          user => ({
            statusCode: 201,
            body: { status: 'success', data: user },
          }),
          // Caso fallido: código de error adecuado
          error => ({
            statusCode: error.statusCode,
            body: {
              status: 'error',
              error: {
                code: error.details.code,
                message: error.message,
              },
            },
          }),
        );
      }

      /**
       * Valida los datos de usuario
       */
      private validateUserData(data: {
        name: string;
        email: string;
      }): Result<void> {
        if (!data?.name?.trim()) {
          return Result.fail(ErrorType.VALIDATION, 'El nombre es obligatorio', {
            code: 'MISSING_NAME',
          });
        }

        if (!data?.email?.trim()) {
          return Result.fail(ErrorType.VALIDATION, 'El email es obligatorio', {
            code: 'MISSING_EMAIL',
          });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
          return Result.fail(
            ErrorType.VALIDATION,
            'El formato de email es inválido',
            { code: 'INVALID_EMAIL' },
          );
        }

        return Result.success();
      }
    }

    // Uso del controlador
    const userService = new UserService();
    const userController = new UserController(userService);

    // Obtener un usuario existente
    console.log('GET /users/1:', userController.getUser('1'));

    // Intentar obtener un usuario que no existe
    console.log('GET /users/999:', userController.getUser('999'));

    // Crear un usuario con datos válidos
    console.log(
      'POST /users:',
      userController.createUser({
        name: 'Jane Doe',
        email: 'jane@example.com',
      }),
    );

    // Intentar crear un usuario con datos inválidos
    console.log(
      'POST /users (inválido):',
      userController.createUser({
        name: '',
        email: 'invalid-email',
      }),
    );
  },

  /**
   * Ejemplo de uso en un repositorio con operaciones de base de datos
   */
  async databaseRepository(): Promise<void> {
    interface Product {
      id: string;
      name: string;
      price: number;
      stock: number;
    }

    class ProductRepository {
      // Base de datos simulada
      private readonly products: Product[] = [
        { id: '1', name: 'Laptop', price: 999.99, stock: 10 },
        { id: '2', name: 'Smartphone', price: 699.99, stock: 15 },
      ];

      /**
       * Busca un producto por ID
       */
      async findById(id: string): Promise<Result<Product>> {
        // Envolver en tryAsync para capturar cualquier error inesperado
        return Result.tryAsync(async () => {
          // Simular retraso de base de datos
          await new Promise(resolve => setTimeout(resolve, 100));

          const product = this.products.find(p => p.id === id);

          if (!product) {
            throw new ResultException(
              ErrorType.NOT_FOUND,
              `Producto con ID ${id} no encontrado`,
              {
                code: 'PRODUCT_NOT_FOUND',
                source: 'product-repository',
              },
            );
          }

          return product;
        });
      }

      /**
       * Actualiza el stock de un producto
       */
      async updateStock(
        id: string,
        quantity: number,
      ): Promise<Result<Product>> {
        return Result.tryAsync(async () => {
          // Validar cantidad
          if (quantity < 0) {
            throw new ResultException(
              ErrorType.VALIDATION,
              'La cantidad debe ser mayor o igual a cero',
              {
                code: 'INVALID_QUANTITY',
                source: 'product-repository',
              },
            );
          }

          // Buscar producto
          const productResult = await this.findById(id);

          if (productResult.isFailure()) {
            throw productResult.getError();
          }

          const product = productResult.getValue();

          // Actualizar stock
          product.stock = quantity;

          // Simular retraso de actualización
          await new Promise(resolve => setTimeout(resolve, 100));

          return product;
        });
      }

      /**
       * Reserva stock para una orden (operación de dominio)
       */
      async reserveStock(id: string, quantity: number): Promise<Result<void>> {
        return Result.tryAsync(async () => {
          // Validar cantidad
          if (quantity <= 0) {
            throw new ResultException(
              ErrorType.VALIDATION,
              'La cantidad debe ser mayor que cero',
              {
                code: 'INVALID_QUANTITY',
                source: 'product-repository',
              },
            );
          }

          // Buscar producto
          const productResult = await this.findById(id);

          if (productResult.isFailure()) {
            throw productResult.getError();
          }

          const product = productResult.getValue();

          // Verificar stock disponible (regla de dominio)
          if (product.stock < quantity) {
            throw new ResultException(
              ErrorType.DOMAIN,
              `Stock insuficiente. Disponible: ${product.stock}, Solicitado: ${quantity}`,
              {
                code: 'INSUFFICIENT_STOCK',
                source: 'product-repository',
                metadata: {
                  productId: id,
                  availableStock: product.stock,
                  requestedQuantity: quantity,
                },
              },
            );
          }

          // Actualizar stock
          product.stock -= quantity;

          // Simular retraso de actualización
          await new Promise(resolve => setTimeout(resolve, 100));
        });
      }
    }

    // Uso del repositorio
    const productRepo = new ProductRepository();

    // Buscar un producto
    const findResult = await productRepo.findById('1');
    console.log(
      'Producto encontrado:',
      findResult.isSuccess()
        ? findResult.getValue()
        : findResult.getError().message,
    );

    // Actualizar stock
    const updateResult = await productRepo.updateStock('1', 20);
    console.log(
      'Stock actualizado:',
      updateResult.isSuccess()
        ? updateResult.getValue()
        : updateResult.getError().message,
    );

    // Reservar stock (operación de dominio)
    const reserveResult = await productRepo.reserveStock('1', 5);

    if (reserveResult.isSuccess()) {
      console.log('Stock reservado correctamente');
    } else {
      const error = reserveResult.getError();
      console.error(`Error (${error.type}): ${error.message}`);

      if (error.type === ErrorType.DOMAIN) {
        console.log('Metadata:', error.details.metadata);
      }
    }

    // Intentar reservar más stock del disponible
    const overReserveResult = await productRepo.reserveStock('1', 100);

    if (overReserveResult.isFailure()) {
      const error = overReserveResult.getError();
      console.error(`Error esperado (${error.type}): ${error.message}`);
    }
  },
};

/**
 * 7. PATRONES Y BUENAS PRÁCTICAS
 * Recomendaciones y patrones para utilizar Result de manera efectiva
 */
const bestPractices = {
  /**
   * Ejemplo de organización por capas usando Result
   */
  layeredArchitectureExample(): void {
    // Simulación de una arquitectura en capas

    // 1. Capa de Repositorio (acceso a datos)
    class UserRepository {
      findByEmail(
        email: string,
      ): Result<{ id: string; email: string; password: string }> {
        // Simular búsqueda en base de datos
        if (email === 'user@example.com') {
          return Result.success({
            id: '1',
            email: 'user@example.com',
            password: 'hashed_password',
          });
        }

        return Result.fail(
          ErrorType.NOT_FOUND,
          `Usuario con email ${email} no encontrado`,
          { source: 'user-repository' },
        );
      }
    }

    // 2. Capa de Servicio (lógica de negocio)
    class AuthService {
      constructor(private readonly _userRepository: UserRepository) {}

      login(email: string, password: string): Result<string> {
        // Validar entrada
        if (!email || !password) {
          return Result.fail(
            ErrorType.VALIDATION,
            'El email y la contraseña son obligatorios',
            { source: 'auth-service' },
          );
        }

        // Buscar usuario y verificar contraseña
        return this._userRepository.findByEmail(email).flatMap(user => {
          // Verificar contraseña (simplificado)
          if (user.password !== password) {
            return Result.fail(
              ErrorType.UNAUTHORIZED,
              'Credenciales inválidas',
              { source: 'auth-service' },
            );
          }

          // Generar token (simplificado)
          return Result.success(`token_for_${user.id}`);
        });
      }
    }

    // Define interfaces claras para los dos tipos de respuesta
    interface ApiSuccessResponse {
      statusCode: number;
      body: {
        status: 'success';
        token: string;
      };
    }

    interface ApiErrorResponse {
      statusCode: number;
      body: {
        status: 'error';
        error: {
          code: string;
          message: string;
        };
      };
    }

    type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

    // 3. Capa de Controlador (manejo de peticiones)
    class AuthController {
      constructor(private readonly _authService: AuthService) {}

      handleLogin(request: { email: string; password: string }): ApiResponse {
        const result = this._authService.login(request.email, request.password);

        return result.fold<ApiResponse>(
          // Respuesta exitosa
          token => ({
            statusCode: 200,
            body: { status: 'success', token },
          }),
          // Respuesta de error
          error => ({
            statusCode: error.statusCode,
            body: {
              status: 'error',
              error: {
                code: error.type,
                message: error.message,
              },
            },
          }),
        );
      }
    }

    // Uso de la arquitectura en capas
    const userRepo = new UserRepository();
    const authService = new AuthService(userRepo);
    const authController = new AuthController(authService);

    // Solicitud con credenciales correctas
    const validResponse = authController.handleLogin({
      email: 'user@example.com',
      password: 'hashed_password',
    });
    console.log('Respuesta válida:', validResponse);

    // Solicitud con credenciales incorrectas
    const invalidResponse = authController.handleLogin({
      email: 'user@example.com',
      password: 'wrong_password',
    });
    console.log('Respuesta inválida:', invalidResponse);
  },

  /**
   * Recomendaciones para un uso efectivo del patrón Result
   */
  recommendationsExample(): void {
    /**
     * RECOMENDACIONES:
     *
     * 1. Preferir Result sobre excepciones para flujos de control
     *    - Usar Result para condiciones esperadas (validación, no encontrado, etc.)
     *    - Reservar excepciones para errores inesperados/excepcionales
     *
     * 2. Preferir flatMap sobre map + if/else
     *    - Evitar: result.map(value => { if (condition) ... })
     *    - Preferir: result.flatMap(value => condition ? Result.success(...) : Result.fail(...))
     *
     * 3. Mantener inmutabilidad
     *    - Nunca modificar el estado interno de un Result
     *    - Siempre retornar nuevos Result de las transformaciones
     *
     * 4. Usar Result.combine para operaciones en paralelo
     *    - Cuando necesitas múltiples valores para continuar
     *
     * 5. Usar tryAsync para operaciones asíncronas que pueden fallar
     *    - Especialmente útil para operaciones I/O, red, base de datos
     *
     * 6. Convertir errores en la capa más externa posible
     *    - Normalizar errores externos a ResultException en adaptadores
     *
     * 7. Proporcionar información útil en los errores
     *    - Tipo adecuado, código descriptivo y metadatos relevantes
     *
     * 8. Resolver Result al final del flujo
     *    - Mantener la cadena de Result lo más largo posible
     *    - Resolver/extraer valores cerca del límite de la aplicación
     */

    // Ejemplos serían los anteriores casos de uso y patrones
    console.log(
      'Consulta las implementaciones para ver ejemplos de buenas prácticas',
    );
  },
};

/**
 * 8. PATRONES AVANZADOS
 * Técnicas avanzadas para el uso del patrón Result
 */
const advancedPatterns = {
  /**
   * Ejemplo de implementación de un pipeline de procesamiento
   */
  pipelineExample(): void {
    // Definir tipos para el pipeline
    type ValidationFn<T> = (input: T) => Result<T>;
    type Pipeline<T> = ValidationFn<T>[];

    // Función para ejecutar un pipeline de validación
    function runValidationPipeline<T>(
      input: T,
      pipeline: Pipeline<T>,
    ): Result<T> {
      // Comenzamos con un resultado exitoso con el valor inicial
      let result: Result<T> = Result.success(input);

      // Ejecutamos cada validación en secuencia
      for (const validator of pipeline) {
        // Solo continuamos si el resultado actual es exitoso
        if (result.isFailure()) {
          break;
        }

        // Aplicamos la siguiente validación al valor actual
        result = validator(result.getValue());
      }

      return result;
    }

    // Ejemplo: Pipeline de validación para un objeto usuario
    interface UserInput {
      username: string;
      email: string;
      age: number;
    }

    // Validadores individuales
    const validateUsername: ValidationFn<UserInput> = input => {
      if (!input.username || input.username.length < 3) {
        return Result.fail(
          ErrorType.VALIDATION,
          'El nombre de usuario debe tener al menos 3 caracteres',
        );
      }
      return Result.success(input);
    };

    const validateEmail: ValidationFn<UserInput> = input => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!input.email || !emailRegex.test(input.email)) {
        return Result.fail(
          ErrorType.VALIDATION,
          'El email tiene un formato inválido',
        );
      }
      return Result.success(input);
    };

    const validateAge: ValidationFn<UserInput> = input => {
      if (input.age < 18) {
        return Result.fail(
          ErrorType.VALIDATION,
          'Debes ser mayor de edad (18+)',
        );
      }
      return Result.success(input);
    };

    // Crear pipeline completo
    const userValidationPipeline: Pipeline<UserInput> = [
      validateUsername,
      validateEmail,
      validateAge,
    ];

    // Validar datos de usuario
    const validUser: UserInput = {
      username: 'johndoe',
      email: 'john@example.com',
      age: 25,
    };

    const invalidUser: UserInput = {
      username: 'jo',
      email: 'invalid-email',
      age: 16,
    };

    // Ejecutar el pipeline con datos válidos
    const validResult = runValidationPipeline(
      validUser,
      userValidationPipeline,
    );
    console.log('Usuario válido:', validResult.isSuccess() ? 'Sí' : 'No');

    if (validResult.isSuccess()) {
      console.log('Datos validados:', validResult.getValue());
    }

    // Ejecutar el pipeline con datos inválidos
    const invalidResult = runValidationPipeline(
      invalidUser,
      userValidationPipeline,
    );
    console.log('Usuario válido:', invalidResult.isSuccess() ? 'Sí' : 'No');

    if (invalidResult.isFailure()) {
      console.log('Error de validación:', invalidResult.getError().message);
    }
  },

  /**
   * Ejemplo de implementación de Railway Oriented Programming
   */
  railwayOrientedProgrammingExample(): void {
    // Railway Oriented Programming es un patrón que trata las operaciones
    // como "vías de tren" donde los resultados exitosos siguen por una vía
    // y los fallidos por otra, sin salirse del "carril".

    // Simulemos un proceso completo de registro de usuario

    interface RegistrationData {
      username: string;
      email: string;
      password: string;
    }

    interface User {
      id: string;
      username: string;
      email: string;
      verified: boolean;
      createdAt: Date;
    }

    // Paso 1: Validar datos
    function validateRegistrationData(
      data: RegistrationData,
    ): Result<RegistrationData> {
      // Validar username
      if (!data.username || data.username.length < 3) {
        return Result.fail(
          ErrorType.VALIDATION,
          'El nombre de usuario debe tener al menos 3 caracteres',
        );
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!data.email || !emailRegex.test(data.email)) {
        return Result.fail(
          ErrorType.VALIDATION,
          'El email tiene un formato inválido',
        );
      }

      // Validar password
      if (!data.password || data.password.length < 8) {
        return Result.fail(
          ErrorType.VALIDATION,
          'La contraseña debe tener al menos 8 caracteres',
        );
      }

      return Result.success(data);
    }

    // Paso 2: Verificar que el email no exista
    function checkEmailAvailability(
      data: RegistrationData,
    ): Result<RegistrationData> {
      // Simulación: el email 'taken@example.com' ya está en uso
      if (data.email === 'taken@example.com') {
        return Result.fail(
          ErrorType.CONFLICT,
          'Este email ya está registrado',
          { code: 'EMAIL_ALREADY_EXISTS' },
        );
      }

      return Result.success(data);
    }

    // Paso 3: Crear usuario en la base de datos
    function createUserInDatabase(data: RegistrationData): Result<User> {
      // Simulación de creación en base de datos
      const user: User = {
        id: `user_${Date.now()}`,
        username: data.username,
        email: data.email,
        verified: false,
        createdAt: new Date(),
      };

      // Simulación: si el username es 'error', falla la creación
      if (data.username === 'error') {
        return Result.fail(
          ErrorType.INFRASTRUCTURE,
          'Error al crear usuario en la base de datos',
          {
            code: 'DATABASE_ERROR',
            isOperational: false,
          },
        );
      }

      return Result.success(user);
    }

    // Paso 4: Enviar email de verificación
    function sendVerificationEmail(user: User): Result<User> {
      // Simulación de envío de email
      console.log(`[EMAIL] Enviando verificación a ${user.email}`);

      // Simulación: si el email contiene 'fail', falla el envío
      if (user.email.includes('fail')) {
        return Result.fail(
          ErrorType.INFRASTRUCTURE,
          'Error al enviar email de verificación',
          {
            code: 'EMAIL_DELIVERY_FAILED',
            metadata: { userId: user.id },
          },
        );
      }

      return Result.success(user);
    }

    // Función principal que ejecuta completamente el proceso usando flatMap
    function registerUser(data: RegistrationData): Result<User> {
      return validateRegistrationData(data)
        .flatMap(checkEmailAvailability)
        .flatMap(createUserInDatabase)
        .flatMap(sendVerificationEmail);
    }

    // Ejemplo 1: Registro exitoso
    const successData: RegistrationData = {
      username: 'johndoe',
      email: 'john@example.com',
      password: 'secure_password',
    };

    const successResult = registerUser(successData);

    if (successResult.isSuccess()) {
      console.log(
        'Usuario registrado correctamente:',
        successResult.getValue(),
      );
    } else {
      console.error('Error inesperado:', successResult.getError().message);
    }

    // Ejemplo 2: Error de validación
    const invalidData: RegistrationData = {
      username: 'jo',
      email: 'invalid-email',
      password: 'short',
    };

    const invalidResult = registerUser(invalidData);

    if (invalidResult.isFailure()) {
      console.error('Error de validación:', invalidResult.getError().message);
    }

    // Ejemplo 3: Conflicto de email
    const conflictData: RegistrationData = {
      username: 'janedoe',
      email: 'taken@example.com',
      password: 'secure_password',
    };

    const conflictResult = registerUser(conflictData);

    if (conflictResult.isFailure()) {
      console.error(
        'Error de conflicto:',
        conflictResult.getError().message,
        `(${conflictResult.getError().details.code})`,
      );
    }
  },
};

// Ejecutar ejemplos seleccionados (en una aplicación real se importarían los módulos)
async function runExamples(): Promise<void> {
  // Ejemplos básicos
  console.log('\n== EJEMPLOS BÁSICOS ==');
  basicExamples.successExample();
  basicExamples.failureExample();

  // Ejemplos de transformación
  console.log('\n== EJEMPLOS DE TRANSFORMACIÓN ==');
  transformationExamples.mapExample();
  transformationExamples.flatMapExample();

  // Ejemplos de manejo de errores
  console.log('\n== EJEMPLOS DE MANEJO DE ERRORES ==');
  errorHandlingExamples.foldExample();
  errorHandlingExamples.recoverExample();

  // Ejemplos de operaciones asíncronas
  console.log('\n== EJEMPLOS DE OPERACIONES ASÍNCRONAS ==');
  await tryExamples.tryAsyncExample();

  // Ejemplos de casos de uso reales
  console.log('\n== CASOS DE USO REALES ==');
  realWorldExamples.userAuthenticationService();
  await realWorldExamples.databaseRepository();

  // Patrones avanzados
  console.log('\n== PATRONES AVANZADOS ==');
  advancedPatterns.pipelineExample();
}

// Ejecutar todos los ejemplos
// runExamples().catch(console.error);
