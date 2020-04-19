import { BaseQuery } from '@deliveryapp/core';

import { Type } from 'class-transformer';

export class PaymentsFilter {
  @Type(() => Number)
  id: number;
}

export class PaymentsOrder {
  status: 'asc' | 'desc';
  total: 'asc' | 'desc';
  createdAt: 'asc' | 'desc';
}

export class PaymentsQuery implements BaseQuery {
  @Type(() => PaymentsFilter)
  filter: PaymentsFilter;

  @Type(() => PaymentsOrder)
  order: PaymentsOrder;

  @Type(() => Number)
  limit: number;

  @Type(() => Number)
  offset: number;
}
