import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoUserRepository } from './repositories/mongo-user.repository';
import { UserSchema, UserSchemaFactory } from './schemas/user.schema';

/**
 * Módulo de persistencia para configurar acceso a datos
 */
@Module({
  imports: [
    // Configuración de conexión a MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>(
          'MONGODB_URI',
          'mongodb://localhost:27017/user_auth',
        ),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),

    // Configuración de modelos de MongoDB
    MongooseModule.forFeature([
      { name: UserSchema.name, schema: UserSchemaFactory },
    ]),
  ],
  providers: [
    // Repositorios
    {
      provide: 'IUserRepository',
      useClass: MongoUserRepository,
    },
  ],
  exports: [
    // Exportamos el repositorio para su uso en otros módulos
    'IUserRepository',
  ],
})
export class PersistenceModule {}
