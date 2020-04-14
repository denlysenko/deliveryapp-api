import { ApiProperty } from '@nestjs/swagger';

import { ILog } from '../interfaces';

export class LogDto implements ILog {
  @ApiProperty()
  readonly action: number;

  @ApiProperty()
  readonly userId: number;

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly data?: any = null;
}
