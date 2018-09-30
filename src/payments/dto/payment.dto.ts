import { ApiModelProperty } from '@nestjs/swagger';

export class PaymentDto {
  @ApiModelProperty()
  readonly id: number;

  @ApiModelProperty({
    description: 'Payment method CASH = 1, NON_CASH = 2',
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
    description: 'Client ID',
  })
  readonly clientId: number;

  @ApiModelProperty({
    description: 'Array of Order IDS',
  })
  readonly orders: number[];
}
