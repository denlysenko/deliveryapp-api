import { OrderErrors, OrderStatuses, UserErrors } from '@deliveryapp/common';
import { Order } from '@deliveryapp/core';

import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  Table,
} from 'sequelize-typescript';

import { BaseEntity } from './base-entity';
import { PaymentEntity } from './payment.entity';
import { UserEntity } from './user.entity';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'orders',
})
export class OrderEntity extends BaseEntity<OrderEntity> implements Order {
  @AllowNull(false)
  @Column({
    validate: {
      notEmpty: {
        msg: OrderErrors.CITY_FROM_REQUIRED_ERR,
      },
    },
  })
  cityFrom: string;

  @AllowNull(false)
  @Column({
    validate: {
      notEmpty: {
        msg: OrderErrors.CITY_TO_REQUIRED_ERR,
      },
    },
  })
  cityTo: string;

  @AllowNull(false)
  @Column({
    validate: {
      notEmpty: {
        msg: OrderErrors.ADDRESS_FROM_REQUIRED_ERR,
      },
    },
  })
  addressFrom: string;

  @AllowNull(false)
  @Column({
    validate: {
      notEmpty: {
        msg: OrderErrors.ADDRESS_TO_REQUIRED_ERR,
      },
    },
  })
  addressTo: string;

  @AllowNull(false)
  @Column({
    validate: {
      notEmpty: {
        msg: OrderErrors.CARGO_NAME_REQUIRED_ERR,
      },
    },
  })
  cargoName: string;

  @Column
  additionalData: string;

  @Column({
    type: DataType.TEXT,
  })
  comment: string;

  @AllowNull(false)
  @Column({
    validate: {
      notEmpty: {
        msg: OrderErrors.CARGO_WEIGHT_REQUIRED_ERR,
      },
    },
  })
  cargoWeight: number;

  @Column
  cargoVolume: number;

  @Column
  senderName: string;
  @Column
  senderCompany: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(45),
    validate: {
      isEmail: {
        msg: UserErrors.INVALID_EMAIL_ERR,
      },
      notEmpty: {
        msg: UserErrors.EMAIL_REQUIRED_ERR,
      },
    },
  })
  senderEmail: string;

  @AllowNull(false)
  @Column({
    validate: {
      notEmpty: {
        msg: OrderErrors.PHONE_REQUIRED_ERR,
      },
    },
  })
  senderPhone: string;

  @Default(OrderStatuses.NEW)
  @Column(DataType.INTEGER)
  status: number;

  @Column
  deliveryCosts: number;

  @Column({
    type: DataType.DATE,
  })
  deliveryDate: Date;

  @Default(false)
  @Column
  paid: boolean;

  @Column({
    type: DataType.DATE,
  })
  paymentDate: Date;

  @BelongsTo(() => UserEntity, 'creatorId')
  creator: UserEntity;

  @BelongsTo(() => UserEntity, 'clientId')
  client: UserEntity;

  @BelongsTo(() => PaymentEntity, 'invoiceId')
  payment: PaymentEntity;
}
