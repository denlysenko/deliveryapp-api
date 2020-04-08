import { ApiProperty } from '@nestjs/swagger';

export class OrdersQuery {
  @ApiProperty({
    description: 'Order ID or Number',
    required: false,
  })
  readonly 'filter[id]': number;

  @ApiProperty({
    description: 'City From',
    required: false,
  })
  readonly 'filter[cityFrom]': string;

  @ApiProperty({
    description: 'City To',
    required: false,
  })
  readonly 'filter[cityTo]': string;

  @ApiProperty({
    description: 'Cargo Name',
    required: false,
  })
  readonly 'filter[cargoName]': string;

  @ApiProperty({
    description: 'Order by ID or Number',
    required: false,
  })
  readonly 'order[id]': 'asc' | 'desc';

  @ApiProperty({
    description: 'Order by City From',
    required: false,
  })
  readonly 'order[cityFrom]': 'asc' | 'desc';

  @ApiProperty({
    description: 'Order by City To',
    required: false,
  })
  readonly 'order[cityTo]': 'asc' | 'desc';

  @ApiProperty({
    description: 'Order by Cargo Name',
    required: false,
  })
  readonly 'order[cargoName]': 'asc' | 'desc';
}
