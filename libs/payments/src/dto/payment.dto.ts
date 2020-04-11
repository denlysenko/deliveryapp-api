import { ApiProperty } from '@nestjs/swagger';

export class PaymentDto {
  @ApiProperty()
  readonly id: number;

  @ApiProperty({
    description: 'Payment method CASH = 1, NON_CASH = 2',
  })
  readonly method: number;

  @ApiProperty()
  readonly status: boolean;

  @ApiProperty()
  readonly total: number;

  @ApiProperty()
  readonly paymentAmount: number;

  @ApiProperty()
  readonly paymentDate: Date;

  @ApiProperty()
  readonly dueDate: Date;

  @ApiProperty()
  readonly notes: string;

  @ApiProperty()
  readonly description: string;

  @ApiProperty({
    description: 'Client ID',
  })
  readonly clientId: number;

  @ApiProperty({
    description: 'Array of Order IDS',
  })
  readonly orders: number[];
}
