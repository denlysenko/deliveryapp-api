import { ApiProperty } from '@nestjs/swagger';

import { OrderDto } from '@orders/dto';

import { UserResponse } from '@users/responses';

export class PaymentResponse {
  @ApiProperty()
  readonly id: number;

  @ApiProperty({
    description: 'Payment method',
    enum: ['Cash', 'Non Cash'],
  })
  readonly method: number;

  @ApiProperty()
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
    description: 'Client',
  })
  readonly client: UserResponse;

  @ApiProperty({
    description: 'Creator',
  })
  readonly creator: UserResponse;

  @ApiProperty({
    description: 'Associated orders',
    isArray: true,
  })
  readonly orders: OrderDto;
}
