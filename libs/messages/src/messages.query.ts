import { BaseQuery } from '@deliveryapp/core';

import { Type } from 'class-transformer';

export class MessagesQuery implements BaseQuery {
  @Type(() => Number)
  limit: number;

  @Type(() => Number)
  offset: number;
}
