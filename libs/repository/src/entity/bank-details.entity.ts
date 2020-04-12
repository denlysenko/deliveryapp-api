import { BankDetails } from '@deliveryapp/core';

import { Column, Default, Table } from 'sequelize-typescript';

import { BaseEntity } from './base-entity';

@Table({
  timestamps: true,
  tableName: 'bank_details',
})
export class BankDetailsEntity extends BaseEntity<BankDetailsEntity>
  implements BankDetails {
  @Column
  name: string;

  @Column
  bin: string;

  @Column
  accountNumber: string;

  @Column
  swift: string;

  @Default(false)
  @Column
  belongsToCompany: boolean;
}
