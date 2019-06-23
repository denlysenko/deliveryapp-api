import { Order } from '@orders/entities';

import { User } from '@users/entities';

import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'payments',
})
export class Payment extends Model<Payment> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

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

  @BelongsTo(() => User, 'clientId')
  client: User;

  @BelongsTo(() => User, 'creatorId')
  creator: User;

  @HasMany(() => Order, 'invoiceId')
  orders: Order[];
}
