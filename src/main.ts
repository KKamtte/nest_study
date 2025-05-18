import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/ExceptionFIlter/http.exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // default 값들을 넣은 채로 인스턴스를 생성하는 것을 허용
      transformOptions: {
        enableImplicitConversion: true, // @Type 을 이용하여 형변환 하는 과정이 필요없도록 함
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter()); // 에러핸들링을 글로벌로 관리
  await app.listen(3000);
}
bootstrap();
