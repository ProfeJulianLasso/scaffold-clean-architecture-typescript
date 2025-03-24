import { Module } from '@nestjs/common';
import { UserService } from '../../application/services/user.service';
import { AuthModule } from '../auth/auth.module';
import { PersistenceModule } from '../persistence/persistence.module';

/**
 * Módulo para configurar los servicios de aplicación
 */
@Module({
  imports: [
    // Importamos los módulos necesarios
    PersistenceModule,
    AuthModule,
  ],
  providers: [
    // Servicios de aplicación
    {
      provide: UserService,
      useFactory: (userRepository, tokenService) => {
        return new UserService(userRepository, tokenService);
      },
      inject: ['IUserRepository', 'ITokenService'],
    },
  ],
  exports: [
    // Exportamos los servicios para su uso en controladores
    UserService,
  ],
})
export class ApplicationModule {}
