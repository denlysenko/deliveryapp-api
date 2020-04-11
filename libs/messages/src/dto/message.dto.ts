import { ApiProperty } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty()
  readonly recipientId?: number;

  @ApiProperty()
  readonly text: string;

  @ApiProperty()
  readonly createdAt?: Date;

  @ApiProperty()
  readonly forEmployee?: boolean;

  @ApiProperty()
  readonly read?: boolean;

  constructor(options: MessageDto) {
    Object.assign(this, options);
  }
}
