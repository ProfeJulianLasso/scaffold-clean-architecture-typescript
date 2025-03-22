import { UUIDv7 } from '@common/utils/uuid-v7';

/**
 * Clase abstracta para los eventos de dominio
 */
export abstract class DomainEvent {
  private readonly _eventId: string;
  private readonly _occurredOn: Date;
  private readonly _eventName: string;

  /**
   * Constructor del evento de dominio
   * @param eventName - Nombre del evento
   */
  constructor(eventName: string) {
    this._eventId = UUIDv7.generate().toString();
    this._occurredOn = new Date();
    this._eventName = eventName;
  }

  /**
   * Identificador único del evento
   */
  public get eventId(): string {
    return this._eventId;
  }

  /**
   * Momento en que ocurrió el evento
   */
  public get occurredOn(): Date {
    return this._occurredOn;
  }

  /**
   * Nombre del evento
   */
  public get eventName(): string {
    return this._eventName;
  }

  /**
   * Compara si este evento es igual a otro
   * @param other - Otro evento para comparar
   */
  public equals(other: DomainEvent): boolean {
    if (other === null || other === undefined) {
      return false;
    }

    if (this === other) {
      return true;
    }

    return this._eventId === other.eventId;
  }

  /**
   * Serializa el evento a un objeto plano
   * Las implementaciones deben sobrescribir este método
   */
  public abstract toPlainObject(): object;
}
