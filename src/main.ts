import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BackendValidationPipe } from './pipes/backendValidation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new BackendValidationPipe());
  await app.listen(4200);
}
bootstrap();
