import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para respuestas estándar de la API
 */
export class ResultResponseDTO {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensaje descriptivo del resultado',
    example: 'Operación completada exitosamente',
  })
  message: string;

  @ApiProperty({
    description: 'Datos adicionales del resultado (opcional)',
    example: { id: '1234', token: 'jwt.token.example' },
    required: false,
  })
  data?: Record<string, unknown>;

  @ApiProperty({
    description: 'Código de error (solo en caso de error)',
    example: 'VALIDATION_ERROR',
    required: false,
  })
  error?: string;

  @ApiProperty({
    description: 'Código HTTP',
    example: 200,
  })
  statusCode: number;
}
