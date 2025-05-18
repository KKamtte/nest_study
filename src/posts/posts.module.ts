import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { CommonModule } from '../common/common.module';
import { LogMiddleware } from '../common/middleware/log.middleware';

@Module({
  // forFeature -> 모델에 해당되는 레포지토리 주입을 할 때 사용
  imports: [
    TypeOrmModule.forFeature([PostsModel]),
    AuthModule,
    UsersModule,
    CommonModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
// 모듈 단위로 미들 웨어 적용
// export class PostsModule implements NestModule {
//   configure(consumer: MiddlewareConsumer): any {
//     consumer.apply(LogMiddleware).forRoutes({
//       path: '*',
//       method: RequestMethod.GET,
//     });
//   }
export class PostsModule {}
