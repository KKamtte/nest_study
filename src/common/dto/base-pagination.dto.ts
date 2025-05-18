import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class BasePaginationDto {
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  where__id__less_than?: number;

  // 이전 마지막 데이터의 ID
  // 이 프로퍼티에 입력된 ID 보다 높은 ID 부터 값을 가져옴
  // @Type(() => Number) // 형변환을 강제로 시킨다 하지만 잘 사용하지 않는다. (enableImplicitConversion 참고)
  @IsNumber()
  @IsOptional()
  where__id__more_than?: number;

  // 정렬
  // createdAt -> 생성된 시간의 내림차/오름차 순으로 정렬
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order__createdAt: 'ASC' | 'DESC' = 'ASC' as const;

  @IsNumber()
  @IsOptional()
  // 몇개의 데이터를 입력 받을지
  take: number = 20;

  @IsNumber()
  @IsOptional()
  where__likeCount__more_than?: number;

  @IsString()
  @IsOptional()
  where__title__i_like?: number;
}
