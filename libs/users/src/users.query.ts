import { BaseQuery } from '@deliveryapp/core';
import { Type } from 'class-transformer';

export class UsersFilter {
  @Type(() => Number)
  id: number;

  @Type(() => Number)
  role: number;

  email: string;
  firstName: string;
  lastName: string;
}

export class UsersOrder {
  id: 'asc' | 'desc';
  firstName: 'asc' | 'desc';
  lastName: 'asc' | 'desc';
}

export class UsersQuery implements BaseQuery {
  @Type(() => UsersFilter)
  filter: UsersFilter;

  @Type(() => UsersOrder)
  order: UsersOrder;

  @Type(() => Number)
  offset: number;

  @Type(() => Number)
  limit: number;
}
