import { ApiProperty } from '@nestjs/swagger';

import { BaseResponse, Message } from '../interfaces';

export class MessageDto implements Message {
  @ApiProperty()
  readonly _id: any;

  @ApiProperty()
  readonly recipientId: number;

  @ApiProperty()
  readonly text: string;

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly forEmployee: boolean;

  @ApiProperty()
  readonly read: boolean;
}

export class MessagesDto implements BaseResponse<Message> {
  @ApiProperty()
  readonly count: number;

  @ApiProperty({ isArray: true, type: MessageDto })
  readonly rows: MessageDto[];
}
