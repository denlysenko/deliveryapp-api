import { ApiModelProperty } from '@nestjs/swagger';

export class LogDto {
  @ApiModelProperty()
  readonly action: number;

  @ApiModelProperty()
  readonly userId: number;

  @ApiModelProperty()
  readonly createdAt: Date;

  @ApiModelProperty()
  readonly data?: any = null;

  constructor(options: LogDto) {
    Object.assign(this, options);
  }
}
