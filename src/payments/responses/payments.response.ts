import { ApiModelProperty } from '@nestjs/swagger';

import { PaymentResponse } from './payment.response';

export class PaymentsResponse {
  @ApiModelProperty()
  readonly count: number;

  @ApiModelProperty({ isArray: true })
  readonly rows: PaymentResponse;
}
