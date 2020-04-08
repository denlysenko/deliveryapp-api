import { ApiProperty } from '@nestjs/swagger';

import { MessageDto } from '../dto/message.dto';

export class MessagesResponse {
  @ApiProperty()
  readonly count: number;

  @ApiProperty({ isArray: true })
  readonly rows: MessageDto;
}
