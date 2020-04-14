import { BaseQuery } from '@deliveryapp/core';

import { Type } from 'class-transformer';

export class LogsFilter {
  @Type(() => Number)
  action: number;

  @Type(() => Number)
  userId: number;
}

export class LogsQuery implements BaseQuery {
  @Type(() => LogsFilter)
  filter: LogsFilter;

  @Type(() => Number)
  limit: number;

  @Type(() => Number)
  offset: number;
}
