import { SecurityInfrastructureModule } from '@infrastructure/security/infrastructure.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [SecurityInfrastructureModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
