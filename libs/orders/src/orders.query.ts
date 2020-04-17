import { BaseQuery } from '@deliveryapp/core';

import { Type } from 'class-transformer';

export class OrdersFilter {
  @Type(() => Number)
  id: number;

  cityFrom: string;
  cityTo: string;
  cargoName: string;
}

export class OrdersOrder {
  id: 'asc' | 'desc';
  cityFrom: 'asc' | 'desc';
  cityTo: 'asc' | 'desc';
  cargoName: 'asc' | 'desc';
}

export class OrdersQuery implements BaseQuery {
  @Type(() => OrdersFilter)
  filter: OrdersFilter;

  @Type(() => OrdersOrder)
  order: OrdersOrder;

  @Type(() => Number)
  limit: number;

  @Type(() => Number)
  offset: number;
}
