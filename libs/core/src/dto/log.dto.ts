import { ApiProperty } from '@nestjs/swagger';

import { Log } from '../interfaces';

export class LogDto implements Log {
  @ApiProperty()
  readonly action: number;

  @ApiProperty()
  readonly userId: number;

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly data?: any = null;
}
