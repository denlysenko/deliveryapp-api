import { ApiProperty, OmitType, PartialType, PickType } from '@nestjs/swagger';

import { PaymentErrors } from '@deliveryapp/common';

import { Exclude, Type } from 'class-transformer';
import { ArrayNotEmpty, IsNotEmpty, IsNumber } from 'class-validator';

import { BaseResponse, Order, Payment, User } from '../interfaces';
import { OrderDto } from './order.dto';
import { UserDto } from './user.dto';

export class PaymentDto implements Payment {
  @ApiProperty()
  readonly id: number;

  @ApiProperty({
    description: 'Payment method CASH = 1, NON_CASH = 2',
    enum: [1, 2],
  })
  readonly method: number;

  @ApiProperty({
    description: 'Payment status',
    enum: [true, false],
  })
  readonly status: boolean;

  @ApiProperty()
  readonly total: number;

  @ApiProperty()
  readonly paymentAmount: number;

  @ApiProperty()
  readonly paymentDate: Date;

  @ApiProperty()
  readonly dueDate: Date;

  @ApiProperty()
  readonly notes: string;

  @ApiProperty()
  readonly description: string;

  @ApiProperty({
    description: 'Associated orders',
    type: () => OmitType(OrderDto, ['client']),
    isArray: true,
  })
  @Type(() => OrderDto)
  readonly orders: Order[];

  @ApiProperty({
    description: 'Client',
    type: PickType(UserDto, [
      'id',
      'email',
      'firstName',
      'lastName',
      'company',
      'phone',
    ]),
  })
  @Type(() => UserDto)
  readonly client: Partial<User>;

  @Exclude()
  creator: Partial<User>;

  @Exclude()
  clientId: number;

  @Exclude()
  creatorId: number;

  @Exclude()
  deletedAt: Date;

  constructor(paymentEntity: Payment) {
    Object.assign(this, paymentEntity);
  }
}

export class PaymentsDto implements BaseResponse<Payment> {
  @ApiProperty()
  readonly count: number;

  @ApiProperty({ isArray: true, type: PaymentDto })
  readonly rows: PaymentDto[];
}

export class CreatePaymentDto {
  @IsNotEmpty({
    message: PaymentErrors.METHOD_REQUIRED_ERR,
  })
  @ApiProperty({
    description: 'Payment method CASH = 1, NON_CASH = 2',
    enum: [1, 2],
  })
  readonly method: number;

  @ApiProperty({
    description: 'Payment status',
    enum: [true, false],
  })
  readonly status: boolean;

  @IsNotEmpty({
    message: PaymentErrors.TOTAL_REQUIRED_ERR,
  })
  @IsNumber({}, { message: PaymentErrors.TOTAL_NOT_NUMBER_ERR })
  @ApiProperty()
  readonly total: number;

  @ApiProperty()
  readonly paymentAmount: number;

  @ApiProperty()
  readonly paymentDate: Date;

  @IsNotEmpty({
    message: PaymentErrors.DUE_DATE_REQUIRED_ERR,
  })
  @ApiProperty()
  readonly dueDate: Date;

  @ApiProperty()
  readonly notes: string;

  @ApiProperty()
  readonly description: string;

  @IsNotEmpty({
    message: PaymentErrors.ORDER_REQUIRED_ERR,
  })
  @ArrayNotEmpty({ message: PaymentErrors.ORDER_REQUIRED_ERR })
  @ApiProperty({
    description: 'Associated orders',
    type: Number,
    isArray: true,
  })
  readonly orders: number[];

  @IsNotEmpty({
    message: PaymentErrors.CLIENT_REQUIRED_ERR,
  })
  @ApiProperty()
  readonly clientId: number;
}

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {}
