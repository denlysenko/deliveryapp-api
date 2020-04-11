import { ApiProperty } from '@nestjs/swagger';

export class LogDto {
  @ApiProperty()
  readonly action: number;

  @ApiProperty()
  readonly userId: number;

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly data?: any = null;

  constructor(options: LogDto) {
    Object.assign(this, options);
  }
}
