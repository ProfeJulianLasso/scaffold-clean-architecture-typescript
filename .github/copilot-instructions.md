# Instrucciones para GitHub Copilot

## Información general

Lenguaje: TypeScript
Framework: NestJS
Base de datos: MongoDB con Mongoose y TypeORM para bases de datos relacionales

El proyecto siempre debe de aplicar DDD con Arquitectura Hexagonal. Para ello, se debe de seguir el siguiente enfoque:

```text
DOMINIO ← APLICACIÓN ← INFRAESTRUCTURA
```

En este modelo, la infraestructura solo conoce a la aplicación, y es la aplicación quien conoce al dominio. Para poder aplicar este modelo necesitaremos:

- Interfaces de repositorio en la capa de aplicación
- DTOs definidos en la capa de aplicación para la comunicación entre aplicación e infraestructura
- Servicios de traducción/mapeo en la capa de aplicación para convertir entre DTOs y objetos del dominio
- Debe ser la capa de aplicación quien defina por medio de interfaces, cómo debe la capa de infraestructura debe implementar los esquemas de persistencia. De esta forma aplicación sabrá cómo se persisten los datos
- La capa de dominio y la capa de aplicación deben mantenerse lo más puras posible. Esto significa:
  - No pueden depender directamente de librerías externas de infraestructura (base de datos, frameworks, etc.)
  - Deben definir interfaces claras para todos los servicios que necesitan de la capa de infraestructura
  - Cualquier dependencia externa necesaria debe ser abstraída mediante interfaces definidas en la capa de aplicación e implementadas en la capa de infraestructura
  - Las interfaces de estas abstracciones deben ubicarse en la capa de aplicación, específicamente en el directorio "abstractions"
- La capa de aplicación debe implementar CQRS

Esto sería el flujo de datos

```text
Base de datos → Infraestructura → DTOs → Aplicación → [mapeo] → Objetos del dominio → Dominio
```

Y en la dirección contraria

```text
Dominio → Objetos del dominio → Aplicación → [mapeo] → DTOs → Infraestructura → Base de datos
```

En lo anterior, la base de datos es sólo un ejemplo del punto final, porque esto podría ser un broker o cualquier otra cosa.

## Descripción del proyecto

Este proyecto es una aplicación de ejemplo para el curso de TypeScript y NestJS.

## Instrucciones generales

- Siempre responder en español
- Siempre usar inglés para el código fuente
- Siempre aplicar buenas prácticas de programación
- Siempre seguir los principios SOLID, especialmente el principio de responsabilidad única e inversión de dependencias
- Siempre aplicar patrones de diseño cuando sea necesario
- El código debe ser simple y legible, siguiendo el principio KISS (Keep It Simple, Stupid)
- Evitar código redundante siguiendo el principio DRY (Don't Repeat Yourself)
- No implementar funcionalidades que no se hayan solicitado explícitamente, adhiriéndose al principio YAGNI (You Ain't Gonna Need It)
- Documentar el código solamente cuando se solicite explícitamente. En dicho caso, la documentación debe seguir rigurosamente las convenciones de estilo de TSDoc, con descripciones completas de parámetros, tipos de retorno y ejemplos cuando sea apropiado
- Hacer pruebas unitarias bajo el patrón AAA (Arrange, Act, Assert) sólo si se solicita de forma explícita
- Cuando se escriba una clase con sólo métodos estáticos, se debe dar preferencia a objetos literales
- Siempre dar preferencia a Result Pattern y ResultException para manejar resultados de operaciones y errores

## TypeScript

### Convenciones de Nomenclatura

- Interfaces escritas tipo PascalCase, prefijo "I" (ejemplo: `ICalculatorService`)
- Types escritos en PascalCase sin prefijo (ejemplo: `UserDto`)
- Atributos escritos tipo camelCase, prefijo guión bajo (`_`) para variables privadas
- Variables locales escritas con camelCase, sin prefijo
- Constantes globales en UPPER_SNAKE_CASE
- Nombres de archivos en kebab-case.ts
- Nombres de clases en PascalCase
- Nombres de métodos en camelCase
- Nombres de enums en PascalCase, y sus valores en PascalCase
- Nombres descriptivos que indiquen propósito y siempre evitar abreviaciones

### Gestión de Variables

- Preferir el uso de `const` sobre `let` y nunca usar `var`
- Usar destructuring para extraer propiedades de objetos y arrays
- Utilizar parámetros por defecto en lugar de condicionales
- Siempre inicializar variables al declararlas
- Evitar cadenas de nullish/optional chaining excesivamente largas
- Usar el operador spread (`...`) para copiar objetos o arrays sin mutar originales

### Tipado

- Priorizar el uso del tipo `unknown` sobre `any`
- Definir explícitamente los tipos de retorno en funciones
- Usar `enum` para definir conjuntos finitos de valores relacionados
- Aprovechar Union Types (`type Status = 'pending' | 'completed' | 'failed'`)
- Implementar Intersection Types para composición de tipos
- Usar Generics para funciones y clases que trabajan con tipos variables
- Aplicar Type Guards (`instanceof`, `typeof`, predicados tipo) para narrowing seguro
- Usar `Record<K, V>` para definir objetos con claves y valores específicos
- Implementar `Partial<T>` para definir objetos que pueden tener propiedades opcionales
- Utilizar `Pick<T, K>` para crear tipos que seleccionen un subconjunto de propiedades
- Aplicar `Omit<T, K>` para crear tipos que excluyan propiedades específicas
- Usar `Readonly<T>` para definir tipos de solo lectura
- Implementar `Required<T>` para hacer obligatorias todas las propiedades opcionales
- Aplicar `NonNullable<T>` para eliminar null y undefined de un tipo

### Estructuras de Datos

- Priorizar el uso de `Map` sobre objetos para almacenar pares clave-valor
- Usar `Set` para almacenar colecciones de valores únicos
- Implementar Arrays tipados para colecciones homogéneas
- Usar Tuples para arrays de longitud fija con tipos diferentes
- Preferir bucles imperativos (for, while) sobre métodos funcionales (forEach, map) exclusivamente en casos donde el rendimiento sea crítico o se trabaje con grandes volúmenes de datos
- Usar early returns con estructuras if independientes en lugar de construcciones if-else-if anidadas

### Funciones

- Limitar a máximo 3 parámetros por función; usar objeto para más parámetros
- Utilizar arrow functions para preservar el contexto `this`
- Usar `async/await` en lugar de callbacks o promesas encadenadas
- Aplicar la técnica de early return para reducir anidación
- Implementar funciones puras cuando sea posible (sin efectos secundarios)
- Favorecer enfoque funcional (map, filter, reduce) para transformaciones de datos

### Manejo de Errores

- Siempre devolver objetos `Result<T>` como respuesta de operaciones, independientemente del manejo interno de errores
- Usar `try/catch` estrictamente cuando sea necesario (I/O, parseo, etc.), capturando las excepciones y transformándolas en objetos `Result<T>` con error
- Crear tipos personalizados de error para casos específicos del dominio
- Implementar logging adecuado en manejo de errores

### Organización de Código

- Un componente/clase por archivo
- Implementar los modificadores de acceso adecuados (private, protected), nunca usar public
- - Los atributos inyectados mediante constructor deben ser readonly y NO llevar el prefijo `_` (ejemplo: `constructor(private readonly userService: IUserService)`), mientras que los atributos privados declarados dentro de la clase SÍ deben llevar el prefijo `_` (ejemplo: `private _name: string;`)
- Las inyecciones de dependencias deben usarse con `this.[dependencia]` al ser utilizadas en el mismo constructor

### Avanzado

- Usar Mapped Types para transformaciones de tipos
- Utilizar Conditional Types para lógica a nivel de tipos
- Usar inyección de dependencias por constructor
- Inyectar interfaces, no implementaciones concretas

## Testing

- Siempre cubrir casos de borde y de esquina en las pruebas
- Mantener independencia entre pruebas
- Nunca escribir pruebas repetitivas
- El titulo de las pruebas debe ser claro, descriptivo y en español
- Usar `describe` para agrupar pruebas y `it` para definir pruebas individuales
- Usar `beforeEach` para inicializar variables y `afterEach` para limpiar
- Usar `beforeAll` para inicializar variables globales y `afterAll` para limpiar
- Usar `jest.fn` para simular funciones
- Usar `jest.mock` para simular dependencias
- Usar `jest.spyOn` para simular funciones
- Usar `jest.resetAllMocks` para limpiar todas las simulaciones
- Usar `jest.resetModules` para limpiar todas las simulaciones de módulos
- Usar `jest.clearAllMocks` para limpiar todas las simulaciones de funciones
- Usar `jest.useFakeTimers` para simular temporizadores
- Usar `jest.advanceTimersByTime` para avanzar el temporizador
- Usar `jest.runAllTimers` para ejecutar todos los temporizadores pendientes
- Usar `jest.setSystemTime` para configurar el tiempo de ejecución

## Convenciones en la estructura de directorios

- Los nombres de directorios deben ser en kebab-case
- Los nombres de archivos deben ser en kebab-case (ejemplo: panel-control.repository.ts)
- Dentro de los archivos, las clases, interfaces y tipos deben seguir PascalCase (ejemplo: PanelControlRepository)
- En las plantillas de estructura, {name} debe interpretarse como el nombre en kebab-case para archivos y directorios, mientras que {Name} debe interpretarse como el mismo nombre en PascalCase para clases, interfaces y tipos

### Ejemplo de nomenclatura

Para un recurso llamado "usuario":

- Directorio: usuario/
- Archivo: usuario.repository.ts
- Clase/Interfaz: IUsuarioRepository, UsuarioRepository

## Estructura de directorios

```text
src/
├── contexts/
│   ├── {name}/                                         # Contexto Acotado: {name}
│   │   ├── domain/                                     # Capa de Dominio (pura)
│   │   │   ├── aggregates/                             # Agregados
│   │   │   │   └── {name}                              # Nombre del agregado
│   │   │   │       ├── entities/                       # Entidades de dominio
│   │   │   │       │   └── {name}.entity.ts            # Entidad `{Name}Entity`
│   │   │   │       ├── events/                         # Eventos de dominio
│   │   │   │       │   └── {name}.event.ts             # Evento `{Name}Event`
│   │   │   │       ├── value-objects/                  # Objetos de valor
│   │   │   │       │   └── {name}.value-object.ts      # Objeto de valor `{Name}ValueObject`
│   │   │   │       ├── {name}.aggregate.ts             # Agregado `{Name}Aggregate`
│   │   │   │       └── {name}.factory.ts               # Fábrica del agregado `{Name}Factory`
│   │   │   ├── exceptions/                             # Excepciones de dominio
│   │   │   │   └── {name}.exception.ts                 # Excepción `{Name}Exception`
│   │   │   ├── policies/                               # Políticas de dominio
│   │   │   │   └── {name}.policy.ts                    # Política `{Name}Policy`
│   │   │   ├── services/                               # Servicios de dominio
│   │   │   │   └── {name}.service.ts                   # Servicio `{Name}Service`
│   │   │   ├── domain.interface.ts                     # Interfaces de dominio `Domain`
│   │   │   └── domain.implementation.ts                # Implementaciones de dominio `DomainImpl` implementa `Domain`
│   │   │
│   │   ├── application/                                # Capa de Aplicación (pura)
│   │   │   ├── abstractions/                           # Abstracciones e interfaces
│   │   │   │   ├── services/                           # Interfaces de servicios
│   │   │   │   │   └── {name}.service.ts               # Servicio `I{Name}Service`
│   │   │   │   ├── messaging/                          # Interfaces para mensajería
│   │   │   │   │   └── {name}.interface.ts             # Interfaz de mensajería `I{Name}Messaging`
│   │   │   │   └── persistence/                        # Interfaces para persistencia
│   │   │   │       └── models/                         # Interfaces para modelos
│   │   │   │       │   └── {name}.model.ts             # Modelo `I{Name}Model`
│   │   │   │       └── repositories/                   # Interfaces para repositorios
│   │   │   │           └── {name}.repository.ts        # Repositorio `I{Name}Repository`
│   │   │   ├── dtos/                                   # DTOs para comunicación
│   │   │   │   ├── commands/                           # DTOs para comandos
│   │   │   │   │   ├── {name}.dto.request.ts           # Implementación de comandos `Command{Name}DTORequest`
│   │   │   │   ├── queries/                            # DTOs para consultas
│   │   │   │   │   ├── {name}.dto.request.ts           # Implementación de consultas `Query{Name}DTORequest`
│   │   │   │   ├── responses/                          # DTOs para respuestas
│   │   │   │   │   └── {name}.dto.response.ts          # Implementación de respuestas `{Name}DTOResponse`
│   │   │   │   └── mappers/                            # Funciones de mapeo
│   │   │   │       └── {name}.mapper.ts                # Implementación de mappers `{Name}Mapper` (DTO app ↔ DTO Domain)
│   │   │   ├── cqrs/                                   # Implementación CQRS
│   │   │   │   ├── commands/                           # Comandos
│   │   │   │   │   ├── handlers/                       # Manejadores de comandos
│   │   │   │   │   │   └── {name}.handler.ts           # Manejador de comandos `{Name}CommandHandler`
│   │   │   │   │   └── implementations/                # Implementaciones
│   │   │   │   │       └── {name}.command.ts           # Implementación de comandos `{Name}Command` implementa `ICommand`
│   │   │   │   └── queries/                            # Consultas
│   │   │   │       ├── handlers/                       # Manejadores de queries
│   │   │   │       │   └── {name}.handler.ts           # Manejador de queries `{Name}QueryHandler`
│   │   │   │       └── implementations/                # Implementaciones
│   │   │   │           └── {name}.query.ts             # Implementación de queries `{Name}Query` implementa `IQuery`
│   │   │   ├── services/                               # Servicios de aplicación
│   │   │   │   └── {name}.service.ts                   # Servicio `{Name}Service`
│   │   │   ├── application.abstract.ts                 # Clases abstractas de aplicación `Application`
│   │   │   └── application.implementation.ts           # Implementaciones de aplicación `ApplicationImpl` extiende `Application`
│   │   │
│   │   └── infrastructure/                             # Capa de Infraestructura
│   │       ├── api/                                    # Componentes API
│   │       │   ├── controllers/                        # Controladores REST
│   │       │   │   └── {name}.controller.ts            # Controlador `{Name}Controller`
│   │       │   └── dtos/                               # DTOs específicos para API
│   │       │       ├── request/                        # DTOs para requests API
│   │       │       │   └── {name}.dto.request.ts       # DTO para requests `{Name}DTORequest`
│   │       │       ├── response/                       # DTOs para responses API
│   │       │       │   └── {name}.dto.response.ts      # DTO para responses `{Name}DTOResponse`
│   │       │       └── mappers/                        # Mappers específicos para API
│   │       │           └── {name}.mapper.ts            # Implementación de mappers `{Name}Mapper` (DTO API ↔ DTO Application)
│   │       ├── persistence/                            # Persistencia
│   │       │   ├── mongodb/                            # Implementación MongoDB
│   │       │   │   ├── schemas/                        # Esquemas Mongoose
│   │       │   │   │   └── {name}.schema.ts            # Esquema `{Name}Schema` implementa `I{Name}Model` del aplicativo
│   │       │   │   ├── repositories/                   # Implementaciones repositorios
│   │       │   │   │   └── {name}.repository.ts        # Repositorio `{Name}Repository` implementa `I{Name}Repository` del aplicativo
│   │       │   │   ├── mappers/                        # Funciones de mapeo
│   │       │   │   │   └── {name}.mongo.mapper.ts      # Implementación de mappers `{Name}MongoMapper` (DTO app ↔ Model from persistence application)
│   │       │   │   ├── mongo.configuration.ts          # Configuración de MongoDB
│   │       │   │   └── mongo.module.ts                 # Módulo MongoDB
│   │       │   └── typeorm/                            # Alternativa TypeORM
│   │       │       ├── entities/                       # Entidades ORM
│   │       │       │   └── {name}.entity.ts            # Entidad `{Name}Entity` implementa `I{Name}Model` del aplicativo
│   │       │       ├── repositories/                   # Implementaciones repositorios
│   │       │       │   └── {name}.repository.ts        # Repositorio `{Name}Repository` implementa `I{Name}Repository` del aplicativo
│   │       │       ├── mappers/                        # Funciones de mapeo
│   │       │       │   └── {name}.typeorm.mapper.ts    # Implementación de mappers `{Name}TypeormMapper` (DTO app ↔ Model from persistence application)
│   │       │       ├── typeorm.configuration.ts        # Configuración de TypeORM
│   │       │       └── typeorm.module.ts               # Módulo TypeORM
│   │       ├── services/                               # Servicios de infraestructura
│   │       │   └── {name}.service.ts                   # Servicio `{Name}Service` implementa `I{Name}Service` del aplicativo
│   │       └── {name}.module.ts                        # Módulo NestJS del contexto `{Name}Context`
│   │
│   └── otro-contexto/                                  # Contexto Acotado: Otro
│       ├── domain/                                     # (estructura similar)
│       ├── application/                                # (estructura similar)
│       └── infrastructure/                             # (estructura similar)
│
├── shared/                                             # Código compartido
│   ├── domain/                                         # Dominio compartido
│   │   ├── value-objects/                              # Objetos de valor comunes
│   │   └── exceptions/                                 # Excepciones comunes
│   ├── application/                                    # Aplicación compartida
│   │   ├── abstractions/                               # Interfaces comunes
│   │   ├── dtos/                                       # DTOs compartidos
│   │   └── exceptions/                                 # Excepciones comunes
│   └── infrastructure/                                 # Infraestructura compartida
│       ├── exceptions/                                 # Excepciones comunes
│       ├── utils/                                      # Utilidades
│       └── interfaces/                                 # Interfaces compartidas
├── app.module.ts                                       # Módulo principal
├── main.config.ts                                      # Configuración principal
└── main.ts                                             # Punto de entrada
```
