import { ApiProperty } from '@nestjs/swagger';

export class MessagesQuery {
  @ApiProperty({
    description: 'Offset',
    required: false,
  })
  readonly offset: number;

  @ApiProperty({
    description: 'Limit',
    required: false,
  })
  readonly limit: number;
}
