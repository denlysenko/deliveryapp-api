import { ApiProperty } from '@nestjs/swagger';

import { Session } from '../interfaces';

export class SessionDto implements Session {
  @ApiProperty()
  readonly socketId: string;

  @ApiProperty()
  readonly userId: number;
}
