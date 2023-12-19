import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { IsOptional, IsString } from 'class-validator';
import { stringValidationMesage } from 'src/common/validation-message/string-validation.message';

// Partial => require 가 아닌 optional 로 만들어주는 기능
// 그냥 extends 를 받게 되면 title 과 content 가 필수 값으로 입력받아야함
export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsString({
    message: stringValidationMesage,
  })
  @IsOptional()
  title?: string;

  @IsString({
    message: stringValidationMesage,
  })
  @IsOptional()
  content?: string;
}
