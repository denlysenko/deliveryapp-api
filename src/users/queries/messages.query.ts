import { ApiModelProperty } from '@nestjs/swagger';

export class MessagesQuery {
  @ApiModelProperty({
    description: 'Offset',
    required: false,
  })
  readonly offset: number;

  @ApiModelProperty({
    description: 'Limit',
    required: false,
  })
  readonly limit: number;
}
