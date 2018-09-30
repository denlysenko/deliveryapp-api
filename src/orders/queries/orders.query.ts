import { ApiModelProperty } from '@nestjs/swagger';

export class OrdersQuery {
  @ApiModelProperty({
    description: 'Order ID or Number',
    required: false,
  })
  readonly 'filter[id]': number;

  @ApiModelProperty({
    description: 'City From',
    required: false,
  })
  readonly 'filter[cityFrom]': string;

  @ApiModelProperty({
    description: 'City To',
    required: false,
  })
  readonly 'filter[cityTo]': string;

  @ApiModelProperty({
    description: 'Cargo Name',
    required: false,
  })
  readonly 'filter[cargoName]': string;

  @ApiModelProperty({
    description: 'Order by ID or Number',
    required: false,
  })
  readonly 'order[id]': 'asc' | 'desc';

  @ApiModelProperty({
    description: 'Order by City From',
    required: false,
  })
  readonly 'order[cityFrom]': 'asc' | 'desc';

  @ApiModelProperty({
    description: 'Order by City To',
    required: false,
  })
  readonly 'order[cityTo]': 'asc' | 'desc';

  @ApiModelProperty({
    description: 'Order by Cargo Name',
    required: false,
  })
  readonly 'order[cargoName]': 'asc' | 'desc';
}
