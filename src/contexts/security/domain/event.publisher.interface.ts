import type { DomainEvent } from '@shared/domain/event.abstract';

/**
 * Interfaz para objetos de dominio que pueden publicar eventos
 */
export interface IEventPublisher {
  /**
   * Obtiene todos los eventos de dominio pendientes
   */
  getDomainEvents(): DomainEvent[];

  /**
   * Elimina todos los eventos pendientes
   */
  clearEvents(): void;
}
