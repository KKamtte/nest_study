import { IsIn, IsNumber, IsOptional } from 'class-validator';

export class PaginatePostsDto {
  // 이전 마지막 데이터의 ID
  // 이 프로퍼티에 입력된 ID 보다 높은 ID 부터 값을 가져옴
  @IsNumber()
  @IsOptional()
  where__id_more_than?: number;

  // 정렬
  // createdAt -> 생성된 시간의 내림차/오름차 순으로 정렬
  @IsIn(['ASC'])
  @IsOptional()
  order__createdAt: 'ASC' = 'ASC';

  // 몇개의 데이터를 입력 받을지
  take: number = 20;
}
