import { ApiModelProperty } from '@nestjs/swagger';

export class OrderDto {
  @ApiModelProperty()
  readonly id: number;

  @ApiModelProperty({ required: true })
  readonly cityFrom: string;

  @ApiModelProperty({ required: true })
  readonly cityTo: string;

  @ApiModelProperty({ required: true })
  readonly addressFrom: string;

  @ApiModelProperty({ required: true })
  readonly addressTo: string;

  @ApiModelProperty({ required: true })
  readonly cargoName: string;

  @ApiModelProperty()
  readonly additionalData: string;

  @ApiModelProperty()
  readonly comment: string;

  @ApiModelProperty({ required: true })
  readonly cargoWeight: number;

  @ApiModelProperty()
  readonly cargoVolume: number;

  @ApiModelProperty()
  readonly senderName: string;

  @ApiModelProperty()
  readonly senderCompany: string;

  @ApiModelProperty({ required: true })
  readonly senderEmail: string;

  @ApiModelProperty({ required: true })
  readonly senderPhone: string;

  @ApiModelProperty()
  readonly status: number;

  @ApiModelProperty()
  readonly deliveryCosts: number;

  @ApiModelProperty()
  readonly deliveryDate: Date;

  @ApiModelProperty()
  readonly paid: boolean;

  @ApiModelProperty()
  readonly paymentDate: Date;

  readonly invoiceId: number;
  readonly creatorId?: number;

  @ApiModelProperty()
  readonly clientId?: number;
}
