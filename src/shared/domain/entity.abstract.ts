import type { DomainEvent } from '@shared/domain/event.abstract';
import type { IDValueObject } from '@shared/domain/value-objects/id.value-object.abstract';

/**
 * Clase abstracta que representa una entidad en el dominio.
 * Toda entidad tiene un identificador único que extiende de IDValueObject.
 *
 * @type ID - Tipo de identificador que extiende de IDValueObject
 */
export abstract class Entity<ID extends IDValueObject> {
  private readonly _id: ID;
  private _domainEvents: DomainEvent[] = [];

  /**
   * Constructor de la entidad
   * @param id - Identificador único de la entidad
   */
  constructor(id: ID) {
    this._id = id;
  }

  /**
   * Obtiene el identificador único de la entidad
   */
  get id(): ID {
    return this._id;
  }

  /**
   * Comprueba si esta entidad es igual a otra
   * @param other - Otra entidad para comparar
   * @returns true si son la misma entidad (mismo ID), false en caso contrario
   */
  equals(other?: Entity<ID>): boolean {
    if (other === null || other === undefined) {
      return false;
    }

    if (this === other) {
      return true;
    }

    if (!(other instanceof Entity)) {
      return false;
    }

    return this._id.equals(other.id);
  }

  /**
   * Añade un evento de dominio a la lista de eventos pendientes
   * @param domainEvent - Evento de dominio a añadir
   */
  protected addDomainEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent);
  }

  /**
   * Elimina un evento de dominio de la lista
   * @param domainEvent - Evento de dominio a eliminar
   */
  removeDomainEvent(domainEvent: DomainEvent): void {
    const index = this._domainEvents.findIndex(event =>
      (event as unknown as { equals(other: DomainEvent): boolean }).equals(
        domainEvent,
      ),
    );
    if (index !== -1) {
      this._domainEvents.splice(index, 1);
    }
  }

  /**
   * Obtiene todos los eventos de dominio pendientes
   * @returns Array de eventos de dominio
   */
  getDomainEvents(): DomainEvent[] {
    return this._domainEvents.slice();
  }

  /**
   * Limpia todos los eventos de dominio pendientes
   */
  clearEvents(): void {
    this._domainEvents = [];
  }

  /**
   * Convierte la entidad a un objeto plano para serialización
   * Las implementaciones pueden sobrescribir este método para personalizar la serialización
   */
  toJSON(): object {
    return {
      id: this._id.toString(),
    };
  }
}
