import { ApiModelProperty } from '@nestjs/swagger';

export class MessageDto {
  @ApiModelProperty()
  readonly recipientId?: number;

  @ApiModelProperty()
  readonly text: string;

  @ApiModelProperty()
  readonly createdAt?: Date;

  @ApiModelProperty()
  readonly forEmployee?: boolean;

  @ApiModelProperty()
  readonly read?: boolean;

  constructor(options: MessageDto) {
    Object.assign(this, options);
  }
}
