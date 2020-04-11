import { ApiProperty } from '@nestjs/swagger';

export class PaymentsQuery {
  @ApiProperty({
    description: 'Payment ID or Number',
    required: false,
  })
  readonly 'filter[id]': number;

  @ApiProperty({
    description: 'Order by Status',
    required: false,
  })
  readonly 'order[status]': 'asc' | 'desc';

  @ApiProperty({
    description: 'Order by Total',
    required: false,
  })
  readonly 'order[total]': 'asc' | 'desc';

  @ApiProperty({
    description: 'Order by Creation Date',
    required: false,
  })
  readonly 'order[createdAt]': 'asc' | 'desc';
}
