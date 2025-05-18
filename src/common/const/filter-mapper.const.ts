import {
  Any,
  ArrayContains,
  ArrayContainedBy,
  ArrayOverlap,
  Between,
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
} from 'typeorm';

/**
 * where__id__not
 * {
 *   where: {
 *     id: Not(value)
 *   }
 * }
 */

export const FILTER_MAPPER = {
  not: Not,
  any: Any,
  array_contains: ArrayContains,
  array_contained_by: ArrayContainedBy,
  array_overlap: ArrayOverlap,
  between: Between,
  i_like: ILike,
  in: In,
  is_null: IsNull,
  less_than: LessThan,
  less_than_or_equal: LessThanOrEqual,
  like: Like,
  more_than: MoreThan,
  more_than_or_equal: MoreThanOrEqual,
};
