import { ApiProperty } from '@nestjs/swagger';

import { PaymentResponse } from './payment.response';

export class PaymentsResponse {
  @ApiProperty()
  readonly count: number;

  @ApiProperty({ isArray: true })
  readonly rows: PaymentResponse;
}
