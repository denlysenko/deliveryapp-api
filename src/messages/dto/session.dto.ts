import { ApiProperty } from '@nestjs/swagger';

export class SessionDto {
  @ApiProperty()
  readonly socketId: string;
}
