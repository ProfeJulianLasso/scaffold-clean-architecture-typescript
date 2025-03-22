/**
 * UUIDv7 Implementation
 *
 * Esta clase implementa la generación y manejo de UUIDs versión 7 según la especificación.
 * Los UUIDv7 son identificadores ordenados por tiempo que incorporan:
 * - Timestamp de milisegundos unix en los primeros 48 bits
 * - Bits de versión (7) y variante
 * - Componente aleatorio
 */

export class UUIDv7 {
  private static readonly _REGEX_VALIDATE: RegExp =
    /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  private readonly _value: string;
  private readonly _timestamp: number;

  /**
   * Constructor privado. Usar los métodos factory para crear instancias.
   * @param value - Valor del UUID
   * @param timestamp - Timestamp en milisegundos
   */
  private constructor(value: string, timestamp: number) {
    this._value = value;
    this._timestamp = timestamp;
  }

  /**
   * Genera un nuevo UUIDv7 usando el timestamp actual
   * @returns Una nueva instancia de UUIDv7
   */
  public static generate(): UUIDv7 {
    const timestamp = Date.now();
    return UUIDv7._fromTimestamp(timestamp);
  }

  /**
   * Genera un UUIDv7 a partir de un timestamp específico
   * @param timestamp - Timestamp en milisegundos
   * @returns {UUIDv7} Una nueva instancia de UUIDv7 con el timestamp indicado
   * @throws {Error} Si el timestamp no es un entero no negativo
   */
  public static fromTimestamp(timestamp: number): UUIDv7 {
    if (!Number.isInteger(timestamp) || timestamp < 0) {
      throw new Error('El timestamp debe ser un entero no negativo');
    }

    return UUIDv7._fromTimestamp(timestamp);
  }

  /**
   * Método privado para generar un UUIDv7 a partir de un timestamp
   * @param timestamp - Timestamp en milisegundos
   * @returns Una nueva instancia de UUIDv7
   */
  private static _fromTimestamp(timestamp: number): UUIDv7 {
    // Convertimos el timestamp a hexadecimal y nos aseguramos de que tenga 12 caracteres (48 bits)
    const timestampHex = timestamp.toString(16).padStart(12, '0');

    // Creamos las partes del UUID
    const timeLow = timestampHex.substring(0, 8);
    const timeMid = timestampHex.substring(8, 12);

    // Para la primera parte de time_hi_and_version, tomamos los bits restantes y establecemos versión 7
    const timeHi = '7' + this._randomHex(3);

    // Para la parte de variante, aseguramos que comience con 8, 9, a, o b (10xx en binario)
    const variantAndRandom = this._getVariantChar() + this._randomHex(3);

    // Generamos la parte final random
    const random = this._randomHex(12);

    // Formamos el UUID según el formato estándar
    const uuid = `${timeLow}-${timeMid}-${timeHi}-${variantAndRandom}-${random}`;

    return new UUIDv7(uuid, timestamp);
  }

  /**
   * Parsea un string UUID y devuelve una instancia de UUIDv7 si es válido
   * @param uuidString - String con formato UUID
   * @returns {UUIDv7} Instancia de UUIDv7
   * @throws {Error} Si el formato no es válido o no es un UUIDv7
   */
  public static parse(uuidString: string): UUIDv7 {
    if (!UUIDv7.isValid(uuidString)) {
      throw new Error(
        `El formato del UUID no es válido o no es un UUIDv7: ${uuidString}`,
      );
    }

    // Extraer el timestamp del UUID
    const parts = uuidString.split('-');
    const timeLow = parts[0];
    const timeMid = parts[1];

    // Reconstruir el timestamp en hexadecimal y convertirlo a número
    const timestampHex = timeLow + timeMid;
    const timestamp = parseInt(timestampHex, 16);

    return new UUIDv7(uuidString.toLowerCase(), timestamp);
  }

  /**
   * Valida si un string tiene formato de UUIDv7 válido
   * @param uuidString - String a validar
   * @returns true si es un UUIDv7 válido, false en caso contrario
   */
  public static isValid(uuidString: string): boolean {
    return this._REGEX_VALIDATE.test(uuidString);
  }

  /**
   * Genera un carácter hexadecimal aleatorio para la variante (8, 9, a, o b)
   * @returns Carácter hexadecimal para la variante
   */
  private static _getVariantChar(): string {
    const variants = ['8', '9', 'a', 'b'];
    const index = Math.floor(Math.random() * variants.length);
    return variants[index];
  }

  /**
   * Genera una cadena hexadecimal aleatoria del tamaño especificado
   * @param length - Longitud de la cadena a generar
   * @returns Cadena hexadecimal aleatoria
   */
  private static _randomHex(length: number): string {
    const bytes = new Uint8Array(Math.ceil(length / 2));

    // Generamos bytes aleatorios de forma segura si crypto está disponible
    if (typeof crypto !== 'undefined') {
      crypto.getRandomValues(bytes);
    } else {
      // Fallback para entornos sin crypto
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }

    // Convertimos a hexadecimal y tomamos la longitud pedida
    let result = '';
    for (let i = 0; i < bytes.length; i++) {
      result += bytes[i].toString(16).padStart(2, '0');
    }

    return result.substring(0, length);
  }

  /**
   * Compara este UUID con otro para ordenación
   * @param other - Otro UUID para comparar
   * @returns Número negativo si este UUID es menor, positivo si es mayor, 0 si son iguales
   */
  public compareTo(other: UUIDv7): number {
    // Primero comparamos por timestamp
    if (this._timestamp !== other._timestamp) {
      return this._timestamp - other._timestamp;
    }

    // Si los timestamps son iguales, comparamos lexicográficamente la parte aleatoria
    return this._value.localeCompare(other._value);
  }

  /**
   * Devuelve el timestamp extraído del UUID
   * @returns Timestamp en milisegundos
   */
  public getTimestamp(): number {
    return this._timestamp;
  }

  /**
   * Devuelve la fecha generada a partir del timestamp
   * @returns Objeto Date
   */
  public getDate(): Date {
    return new Date(this._timestamp);
  }

  /**
   * Convierte el UUID a representación de string
   * @returns Representación string del UUID
   */
  public toString(): string {
    return this._value;
  }

  /**
   * Devuelve la representación JSON del UUID (su valor string)
   * @returns Valor string del UUID
   */
  public toJSON(): string {
    return this._value;
  }

  /**
   * Compara si este UUID es igual a otro
   * @param other - Otro objeto para comparar
   * @returns true si son iguales, false en caso contrario
   */
  public equals(other: unknown): boolean {
    if (!(other instanceof UUIDv7)) {
      return false;
    }

    return this._value === other._value;
  }
}
