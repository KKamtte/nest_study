import { BadRequestException, Injectable } from '@nestjs/common';
import { BasePaginationDto } from './dto/base-pagination.dto';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { BaseModel } from './entity/base.entity';
import { FILTER_MAPPER } from './const/filter-mapper.const';
import { ConfigService } from '@nestjs/config';
import { ENV_HOST_KEY, ENV_PROTOCOL_KEY } from './const/env-keys.const';

@Injectable()
export class CommonService {
  constructor(private readonly configService: ConfigService) {}
  paginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T>,
    path: string,
  ) {
    if (dto.page) {
      return this.pagePaginate(dto, repository, overrideFindOptions);
    }

    return this.cursorPaginate(dto, repository, overrideFindOptions, path);
  }

  private async pagePaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T>,
  ) {
    const findOptions = this.composeFindOptions<T>(dto);

    const [data, count] = await repository.findAndCount({
      ...findOptions,
      ...overrideFindOptions,
    });

    return {
      data,
      count,
    };
  }

  private async cursorPaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T>,
    path: string,
  ) {
    /**
     * 다양한 where 쿼리 만들어야함 - 일반화 작업
     * where__likeCount__more_than
     * where__title__ilike
     */
    const findOptions = this.composeFindOptions<T>(dto);

    const results = await repository.find({
      ...findOptions,
      ...overrideFindOptions,
    });

    // 해당되는 포스트가 0개 이상이면
    // 마지막 포스트를 가져오고
    // 아니면 0을 반환한다
    const lastItem =
      results.length > 0 && results.length === dto.take
        ? results[results.length - 1]
        : null;

    const protocol = this.configService.get<string>(ENV_PROTOCOL_KEY);
    const host = this.configService.get<string>(ENV_HOST_KEY);
    const nextUrl = lastItem && new URL(`${protocol}://${host}/${path}`);

    if (nextUrl) {
      /**
       * dto 의 키 값을 확인하고
       * 키값에 해당하는 value 가 존재하면
       * param 에 그대로 붙여넣는다.
       * 단, id 값만 lastItem의 마지막 값으로 넣어준다.
       */
      for (const key of Object.keys(dto)) {
        if (key !== 'where__id__more_than' && key !== 'where__id__less_than') {
          nextUrl.searchParams.append(key, dto[key]);
        }
      }

      let key = null;

      if (dto.order__createdAt === 'ASC') {
        key = 'where__id__more_than';
      } else {
        key = 'where__id__less_than';
      }

      nextUrl.searchParams.append(key, lastItem.id.toString());
    }

    return {
      data: results,
      cursor: {
        after: lastItem?.id ?? null,
      },
      count: results.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  private composeFindOptions<T extends BaseModel>(
    dto: BasePaginationDto,
  ): FindManyOptions<T> {
    /**
     * 반환값
     * where,
     * order
     * take
     * skip -> 페이지 기반일 경우
     */
    /**
     * DTO 의 현재 생긴 구조는 다음과 같다
     * {
     *   where__id__more_than: 1,
     *   order__createAt: 'ASC'
     * }
     *
     * 현재는 where__id__more_than / where__id__less_than 에 해당하는 필터만 사용중
     * 추후 where__likeCount__more_than 이나 where__title__ilike 등 추가 필터를 넣고 싶을때
     * 모든 where 필터를 자동으로 파싱한다.
     *
     * 1) where로 시작한다면 필터 로직을 적용한다.
     * 2) order로 시작한다면 정렬 로직을 적용한다.
     * 3) 필터 로직을 적용한다면 '__' 기준으로 split 했을 떄 3개의 값으로 나뉘는지 2개로 나뉘는지 확인한다.
     *    3-1) 3개의 값으로 나뉜다면 FILTER_MAPPER 에서 해당되는 operator 함수를 찾아서 적용한다.
     *          ['where', 'id', 'more_than']
     *    3-2) 2개의 값으로 나뉜다면 정확한 값을 필터하는 것이기 떄문에 operator 없이 적용한다.
     *          ['where', 'id']
     * 4) order의 경우 3-2 같이 적용한다.
     */
    let where: FindOptionsWhere<T> = {};
    let order: FindOptionsOrder<T> = {};

    for (const [key, value] of Object.entries(dto)) {
      // key -> where__id__less_than
      // value -> 1
      if (key.startsWith('where__')) {
        where = {
          ...where,
          ...this.parseWhereFilter(key, value),
        };
      } else if (key.startsWith('order__')) {
        order = {
          ...order,
          ...this.parseWhereFilter(key, value),
        };
      }
    }

    return {
      where,
      order,
      take: dto.take,
      skip: dto.page ? dto.take * (dto.page - 1) : null,
    };
  }

  private parseWhereFilter<T extends BaseModel>(
    key: string,
    value: any,
  ): FindOptionsWhere<T> | FindOptionsOrder<T> {
    const options: FindOptionsWhere<T> = {};
    /**
     * 예를 들어 where__id_more_than
     * __ 를 기준으로 나눴을때
     *
     * ['where', 'id', 'more_than'] 으로 나뉠 수 있다.
     */
    const split = key.split('__');

    if (split.length != 2 && split.length != 3) {
      throw new BadRequestException('where 오류');
    }

    if (split.length == 2) {
      // ['where', 'id]
      const [_, field] = split;

      /**
       * field -> id
       * value -> 1
       * {
       *   id: 3,
       * }
       */
      options[field] = value;
    } else {
      // 길이가 3일 경우 Typeorm 유틸리티 적용이 필요한 경우
      // [where, id, more_than]
      const [_, field, operator] = split;

      // where__id__between = 3,4
      // 만약 split 대상 문자가 존재함지 않으면 길이가 무조건 1이다.
      const values = value.toString().split(',');

      if (operator === 'between') {
        // field -> id
        // operator -> between
        // FILTER_MAPPER[operator] -> Between
        options[field] = FILTER_MAPPER[operator](values[0], values[1]);
      } else {
        // field -> id
        // operator -> more_than
        // FILTER_MAPPER[operator] -> MoreThan

        if (operator === 'i_like') {
          options[field] = FILTER_MAPPER[operator](`%${value}%`);
        } else {
          options[field] = FILTER_MAPPER[operator](value);
        }
      }
    }

    return options;
  }
}
