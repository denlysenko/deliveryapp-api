import { ApiProperty, OmitType, PartialType, PickType } from '@nestjs/swagger';

import { OrderErrors } from '@deliveryapp/common';

import { Exclude, Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, ValidateIf } from 'class-validator';

import { BaseResponse, Order, Payment, User } from '../interfaces';
import { PaymentDto } from './payment.dto';
import { UserDto } from './user.dto';

export class OrderDto implements Order {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly cityFrom: string;

  @ApiProperty()
  readonly cityTo: string;

  @ApiProperty()
  readonly addressFrom: string;

  @ApiProperty()
  readonly addressTo: string;

  @ApiProperty()
  readonly cargoName: string;

  @ApiProperty()
  readonly additionalData: string;

  @ApiProperty()
  readonly comment: string;

  @ApiProperty()
  readonly cargoWeight: number;

  @ApiProperty()
  readonly cargoVolume: number;

  @ApiProperty()
  readonly senderName: string;

  @ApiProperty()
  readonly senderCompany: string;

  @ApiProperty()
  readonly senderEmail: string;

  @ApiProperty()
  readonly senderPhone: string;

  @ApiProperty()
  readonly status: number;

  @ApiProperty()
  readonly deliveryCosts: number;

  @ApiProperty()
  readonly deliveryDate: Date;

  @ApiProperty()
  readonly paid: boolean;

  @ApiProperty()
  readonly paymentDate: Date;

  @ApiProperty()
  readonly invoiceId: number;

  @ApiProperty({
    type: () => PaymentDto,
  })
  @Type(() => PaymentDto)
  readonly payment: Payment;

  @ApiProperty({
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
  clientId: number;

  @Exclude()
  creatorId: number;

  @Exclude()
  deletedAt: Date;

  constructor(orderEntity: Order) {
    Object.assign(this, orderEntity);
  }
}

export class OrdersDto implements BaseResponse<Order> {
  @ApiProperty()
  readonly count: number;

  @ApiProperty({ isArray: true, type: OmitType(OrderDto, ['payment']) })
  readonly rows: OrderDto[];
}

export class CreateOrderDto implements Omit<Order, 'id'> {
  @IsNotEmpty({
    message: OrderErrors.CITY_FROM_REQUIRED_ERR,
  })
  @ApiProperty({ required: true })
  readonly cityFrom: string;

  @IsNotEmpty({
    message: OrderErrors.CITY_TO_REQUIRED_ERR,
  })
  @ApiProperty({ required: true })
  readonly cityTo: string;

  @IsNotEmpty({
    message: OrderErrors.ADDRESS_FROM_REQUIRED_ERR,
  })
  @ApiProperty({ required: true })
  readonly addressFrom: string;

  @IsNotEmpty({
    message: OrderErrors.ADDRESS_TO_REQUIRED_ERR,
  })
  @ApiProperty({ required: true })
  readonly addressTo: string;

  @IsNotEmpty({
    message: OrderErrors.CARGO_NAME_REQUIRED_ERR,
  })
  @ApiProperty({ required: true })
  readonly cargoName: string;

  @ApiProperty()
  readonly additionalData: string;

  @ApiProperty()
  readonly comment: string;

  @IsNotEmpty({
    message: OrderErrors.CARGO_WEIGHT_REQUIRED_ERR,
  })
  @ApiProperty({ required: true })
  readonly cargoWeight: number;

  @ApiProperty()
  readonly cargoVolume: number;

  @ApiProperty()
  readonly senderName: string;

  @ApiProperty()
  readonly senderCompany: string;

  @IsNotEmpty({
    message: OrderErrors.EMAIL_REQUIRED_ERR,
  })
  @IsEmail(
    {},
    {
      message: OrderErrors.INVALID_EMAIL_ERR,
    },
  )
  @ApiProperty({ required: true })
  readonly senderEmail: string;

  @IsNotEmpty({
    message: OrderErrors.PHONE_REQUIRED_ERR,
  })
  @ApiProperty({ required: true })
  readonly senderPhone: string;
}

export class UpdateOrderDto extends PartialType(
  OmitType(OrderDto, ['payment', 'client']),
) {
  @ValidateIf((order) => order.cityFrom !== undefined)
  @IsNotEmpty({
    message: OrderErrors.CITY_FROM_REQUIRED_ERR,
  })
  readonly cityFrom: string;

  @ValidateIf((order) => order.cityTo !== undefined)
  @IsNotEmpty({
    message: OrderErrors.CITY_TO_REQUIRED_ERR,
  })
  readonly cityTo: string;

  @ValidateIf((order) => order.addressFrom !== undefined)
  @IsNotEmpty({
    message: OrderErrors.ADDRESS_FROM_REQUIRED_ERR,
  })
  readonly addressFrom: string;

  @ValidateIf((order) => order.addressTo !== undefined)
  @IsNotEmpty({
    message: OrderErrors.ADDRESS_TO_REQUIRED_ERR,
  })
  readonly addressTo: string;

  @ValidateIf((order) => order.cargoName !== undefined)
  @IsNotEmpty({
    message: OrderErrors.CARGO_NAME_REQUIRED_ERR,
  })
  readonly cargoName: string;

  @ValidateIf((order) => order.cargoWeight !== undefined)
  @IsNotEmpty({
    message: OrderErrors.CARGO_WEIGHT_REQUIRED_ERR,
  })
  readonly cargoWeight: number;

  @ValidateIf((order) => order.senderEmail !== undefined)
  @IsNotEmpty({
    message: OrderErrors.EMAIL_REQUIRED_ERR,
  })
  @IsEmail(
    {},
    {
      message: OrderErrors.INVALID_EMAIL_ERR,
    },
  )
  readonly senderEmail: string;

  @ValidateIf((order) => order.senderPhone !== undefined)
  @IsNotEmpty({
    message: OrderErrors.PHONE_REQUIRED_ERR,
  })
  readonly senderPhone: string;
}
