import { ApiModelProperty } from '@nestjs/swagger';

import { OrderDto } from '@orders/dto';

import { UserResponse } from '@users/responses';

export class PaymentResponse {
  @ApiModelProperty()
  readonly id: number;

  @ApiModelProperty({
    description: 'Payment method',
    enum: ['Cash', 'Non Cash'],
  })
  readonly method: number;

  @ApiModelProperty()
  readonly status: boolean;

  @ApiModelProperty()
  readonly total: number;

  @ApiModelProperty()
  readonly paymentAmount: number;

  @ApiModelProperty()
  readonly paymentDate: Date;

  @ApiModelProperty()
  readonly dueDate: Date;

  @ApiModelProperty()
  readonly notes: string;

  @ApiModelProperty()
  readonly description: string;

  @ApiModelProperty({
    description: 'Client',
  })
  readonly client: UserResponse;

  @ApiModelProperty({
    description: 'Creator',
  })
  readonly creator: UserResponse;

  @ApiModelProperty({
    description: 'Associated orders',
    isArray: true,
  })
  readonly orders: OrderDto;
}
