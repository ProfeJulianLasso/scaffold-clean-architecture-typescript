import { NestFactory } from '@nestjs/core';
import { InfrastructureModule } from './context/infrastructure/infrastructure.module';

async function bootstrap() {
  const app = await NestFactory.create(InfrastructureModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
