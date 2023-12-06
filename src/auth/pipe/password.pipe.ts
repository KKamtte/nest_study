import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class PasswordPipe implements PipeTransform {
  // value: 입력받은 값
  /**
   * metadata: Paramtype
   * - type: 입력받은 타입 (body, query, param)
   * - metatype: 변수를 어떤 타입으로 지정하는지
   * deletePost(@Param('id', ParseIntPipe) id: number) 에서 id: number 부분
   * - data: 데코레이터에서 받은 매개변수의 이름
   * `@Body('userId')` 라고 하였을 때 `userId` 부분
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: any, metadata: ArgumentMetadata) {
    if (value.length > 8) {
      throw new BadRequestException('비밀번호는 8자 이하로 입력해야함');
    }

    return value.toString();
  }
}
