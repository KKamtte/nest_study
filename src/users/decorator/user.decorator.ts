import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';
import { UsersModel } from '../entities/users.entity';

export const User = createParamDecorator(
  (data: keyof UsersModel | undefined, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    const user = req.user as UsersModel;

    if (!user) {
      throw new InternalServerErrorException(
        'Request에 user 프로퍼티가 존재하지 않습니다',
      );
    }

    // @User('id') 를 통해 data 에 id 라는 key 값이 들어오도록함
    if (data) {
      return user[data];
    }

    // 만약 @User() 라면 undefined 이기 떄문에 user 전체가 반환됨
    return user;
  },
);
