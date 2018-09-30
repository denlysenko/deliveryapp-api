import { ApiModelProperty } from '@nestjs/swagger';

export class PaymentsQuery {
  @ApiModelProperty({
    description: 'Payment ID or Number',
    required: false,
  })
  readonly 'filter[id]': number;

  @ApiModelProperty({
    description: 'Order by Status',
    required: false,
  })
  readonly 'order[status]': 'asc' | 'desc';

  @ApiModelProperty({
    description: 'Order by Total',
    required: false,
  })
  readonly 'order[total]': 'asc' | 'desc';

  @ApiModelProperty({
    description: 'Order by Creation Date',
    required: false,
  })
  readonly 'order[createdAt]': 'asc' | 'desc';
}
