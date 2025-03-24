import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para la solicitud de registro de usuario (API)
 */
export class RegisterUserDTO {
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'John Doe',
  })
  readonly name: string;

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
