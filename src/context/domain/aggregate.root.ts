import { Entity } from '@common/entities/entity.abstract';
import type { IDValueObject } from '@common/value-objects/id.value-object.abstract';
import type { IEventPublisher } from './event.publisher.interface';

/**
 * Clase abstracta que representa un agregado raíz en el dominio.
 * Un agregado raíz es responsable de mantener la consistencia en cada parte
 * del agregado y es la única entidad a la que se puede acceder desde fuera
 * del agregado.
 *
 * @type ID - Tipo de identificador que extiende de IDValueObject
 */
export abstract class AggregateRoot<ID extends IDValueObject>
  extends Entity<ID>
  implements IEventPublisher {}
