import { Payment } from '@deliveryapp/core';

import {
  BelongsTo,
  Column,
  DataType,
  Default,
  HasMany,
  Table,
} from 'sequelize-typescript';

import { BaseEntity } from './base-entity';
import { OrderEntity } from './order.entity';
import { UserEntity } from './user.entity';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'payments',
})
export class PaymentEntity extends BaseEntity<PaymentEntity>
  implements Payment {
  @Column
  method: number;

  @Default(false)
  @Column
  status: boolean;

  @Column
  total: number;

  @Column
  paymentAmount: number;

  @Column({
    type: DataType.DATE,
  })
  paymentDate: Date;

  @Column({
    type: DataType.DATE,
  })
  dueDate: Date;

  @Column({
    type: DataType.TEXT,
  })
  notes: string;

  @Column({
    type: DataType.TEXT,
  })
  description: string;

  @BelongsTo(() => UserEntity, 'clientId')
  client: UserEntity;

  @BelongsTo(() => UserEntity, 'creatorId')
  creator: UserEntity;

  @HasMany(() => OrderEntity, 'invoiceId')
  orders: OrderEntity[];
}
