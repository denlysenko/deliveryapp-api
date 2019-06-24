import { ApiModelProperty } from '@nestjs/swagger';

export class SessionDto {
  @ApiModelProperty()
  readonly socketId: string;
}
