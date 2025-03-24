import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDTORequest } from '../../application/dtos/requests/login.dto.request';
import { RegisterUserDTORequest } from '../../application/dtos/requests/register-user.dto.request';
import type { UserService } from '../../application/services/user.service';
import type { LoginDTO } from '../dtos/login.dto';
import type { RegisterUserDTO } from '../dtos/register-user.dto';
import { ResultResponseDTO } from '../dtos/result-response.dto';
import { resultResponseFactory } from '../factories/result-response.factory';

/**
 * Controlador para operaciones de autenticación
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  /**
   * @param _userService - Servicio de usuario de la capa de aplicación
   */
  constructor(private readonly _userService: UserService) {}

  /**
   * Endpoint para registrar un nuevo usuario
   * @param registerDto - DTO con los datos de registro
   * @returns Respuesta con el resultado de la operación
   */
  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuario registrado exitosamente',
    type: ResultResponseDTO,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
    type: ResultResponseDTO,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'El email ya está registrado',
    type: ResultResponseDTO,
  })
  async register(
    @Body() registerDto: RegisterUserDTO,
  ): Promise<ResultResponseDTO> {
    // Convertir DTO de API a DTO de aplicación
    const request = new RegisterUserDTORequest(
      registerDto.name,
      registerDto.email,
      registerDto.password,
    );

    // Ejecutar caso de uso
    const result = await this._userService.register(request);

    // Convertir resultado a respuesta HTTP
    return resultResponseFactory.createFromResult(result, HttpStatus.CREATED);
  }

  /**
   * Endpoint para iniciar sesión
   * @param loginDto - DTO con las credenciales
   * @returns Respuesta con el resultado de la operación
   */
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Inicio de sesión exitoso',
    type: ResultResponseDTO,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Credenciales inválidas',
    type: ResultResponseDTO,
  })
  async login(@Body() loginDto: LoginDTO): Promise<ResultResponseDTO> {
    // Convertir DTO de API a DTO de aplicación
    const request = new LoginDTORequest(loginDto.email, loginDto.password);

    // Ejecutar caso de uso
    const result = await this._userService.login(request);

    // Convertir resultado a respuesta HTTP
    return resultResponseFactory.createFromResult(result, HttpStatus.OK);
  }
}
