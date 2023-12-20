import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // default 값들을 넣은 채로 인스턴스를 생성하는 것을 허용
    }),
  );
  await app.listen(3000);
}
bootstrap();
