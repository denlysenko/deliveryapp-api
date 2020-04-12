import { Address } from '@deliveryapp/core';

import { Column, Default, Table } from 'sequelize-typescript';

import { BaseEntity } from './base-entity';

@Table({
  timestamps: true,
  tableName: 'addresses',
})
export class AddressEntity extends BaseEntity<AddressEntity>
  implements Address {
  @Column
  country: string;

  @Column
  city: string;

  @Column
  street: string;

  @Column
  house: string;

  @Default(false)
  @Column
  belongsToCompany: boolean;
}
