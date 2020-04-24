import { Address } from '@deliveryapp/core';

import { Column, Default, Table, BelongsTo } from 'sequelize-typescript';

import { BaseEntity } from './base-entity';
import { UserEntity } from './user.entity';

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

  @BelongsTo(() => UserEntity, 'userId')
  user?: UserEntity;
}
