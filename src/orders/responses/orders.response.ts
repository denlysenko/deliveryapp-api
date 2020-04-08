import { ApiProperty } from '@nestjs/swagger';

import { OrderDto } from '../dto/order.dto';

export class OrdersResponse {
  @ApiProperty()
  readonly count: number;

  @ApiProperty({ isArray: true })
  readonly rows: OrderDto;
}
