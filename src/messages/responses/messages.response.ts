import { ApiModelProperty } from '@nestjs/swagger';

import { MessageDto } from '../dto/message.dto';

export class MessagesResponse {
  @ApiModelProperty()
  readonly count: number;

  @ApiModelProperty({ isArray: true })
  readonly rows: MessageDto;
}
