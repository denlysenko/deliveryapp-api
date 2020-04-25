import { PaymentErrors } from '@deliveryapp/common';
import { Payment } from '@deliveryapp/core';

import {
  BelongsTo,
  Column,
  DataType,
  Default,
  HasMany,
  Scopes,
  Table,
  ForeignKey,
} from 'sequelize-typescript';

import { BaseEntity } from './base-entity';
import { OrderEntity } from './order.entity';
import { UserEntity } from './user.entity';

const USER_ATTRIBUTES = [
  'id',
  'email',
  'firstName',
  'lastName',
  'company',
  'phone',
];

@Scopes(() => ({
  client: {
    include: [
      {
        model: UserEntity,
        as: 'client',
        attributes: USER_ATTRIBUTES,
      },
    ],
  },
  order: {
    include: [OrderEntity],
  },
}))
@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'payments',
})
export class PaymentEntity extends BaseEntity<PaymentEntity>
  implements Payment {
  @Column({
    validate: {
      notEmpty: {
        msg: PaymentErrors.METHOD_REQUIRED_ERR,
      },
    },
  })
  method: number;

  @Default(false)
  @Column
  status: boolean;

  @Column({
    validate: {
      notEmpty: {
        msg: PaymentErrors.TOTAL_REQUIRED_ERR,
      },
      isNumeric: {
        msg: PaymentErrors.TOTAL_NOT_NUMBER_ERR,
      },
    },
  })
  total: number;

  @Column
  paymentAmount: number;

  @Column({
    type: DataType.DATE,
  })
  paymentDate: Date;

  @Column({
    type: DataType.DATE,
    validate: {
      notEmpty: {
        msg: PaymentErrors.DUE_DATE_REQUIRED_ERR,
      },
    },
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

  @ForeignKey(() => UserEntity)
  @Column
  clientId: number;

  @BelongsTo(() => UserEntity)
  client: UserEntity;

  @BelongsTo(() => UserEntity, 'creatorId')
  creator: UserEntity;

  @HasMany(() => OrderEntity, 'invoiceId')
  orders: OrderEntity[];
}
