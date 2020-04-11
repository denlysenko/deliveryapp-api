import { ApiProperty } from '@nestjs/swagger';

export class OrderDto {
  @ApiProperty()
  readonly id: number;

  @ApiProperty({ required: true })
  readonly cityFrom: string;

  @ApiProperty({ required: true })
  readonly cityTo: string;

  @ApiProperty({ required: true })
  readonly addressFrom: string;

  @ApiProperty({ required: true })
  readonly addressTo: string;

  @ApiProperty({ required: true })
  readonly cargoName: string;

  @ApiProperty()
  readonly additionalData: string;

  @ApiProperty()
  readonly comment: string;

  @ApiProperty({ required: true })
  readonly cargoWeight: number;

  @ApiProperty()
  readonly cargoVolume: number;

  @ApiProperty()
  readonly senderName: string;

  @ApiProperty()
  readonly senderCompany: string;

  @ApiProperty({ required: true })
  readonly senderEmail: string;

  @ApiProperty({ required: true })
  readonly senderPhone: string;

  @ApiProperty()
  readonly status: number;

  @ApiProperty()
  readonly deliveryCosts: number;

  @ApiProperty()
  readonly deliveryDate: Date;

  @ApiProperty()
  readonly paid: boolean;

  @ApiProperty()
  readonly paymentDate: Date;

  readonly invoiceId: number;
  readonly creatorId?: number;

  @ApiProperty()
  readonly clientId?: number;
}
