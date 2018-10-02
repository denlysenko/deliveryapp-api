import { OrderStatuses } from 'common/enums/order-statuses.enum';
import { OrderErrors, UserErrors } from 'common/enums/validation-errors.enum';
import { Payment } from 'payments/entities/Payment';
import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { User } from 'users/entities/User';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'orders',
})
export class Order extends Model<Order> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

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

  @BelongsTo(() => User, 'creatorId')
  creator: User;

  @BelongsTo(() => User, 'clientId')
  client: User;

  @BelongsTo(() => Payment, 'invoiceId')
  payment: Payment;
}
