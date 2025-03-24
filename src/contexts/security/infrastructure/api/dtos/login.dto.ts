import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para la solicitud de inicio de sesión (API)
 */
export class LoginDTO {
  @ApiProperty({
    description: 'Correo electrónico',
    example: 'user@example.com',
  })
  readonly email: string;

  @ApiProperty({
    description: 'Contraseña',
    example: 'Password123!',
  })
  readonly password: string;
}
