import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModel } from './entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsersModel])],
  controllers: [UsersController],
  providers: [UsersService], // 이 안에 UserService 만 사용할 수 있음
  exports: [UsersService], // exports 에 입력된 값이 다른 모듈에 사용이 가능함
})
export class UsersModule {}
