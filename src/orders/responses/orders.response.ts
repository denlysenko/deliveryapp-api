import { ApiModelProperty } from '@nestjs/swagger';

import { OrderDto } from '../dto/order.dto';

export class OrdersResponse {
  @ApiModelProperty()
  readonly count: number;

  @ApiModelProperty({ isArray: true })
  readonly rows: OrderDto;
}
