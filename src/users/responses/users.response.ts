import { ApiModelProperty } from '@nestjs/swagger';

import { UserResponse } from './user.response';

export class UsersResponse {
  @ApiModelProperty()
  readonly count: number;

  @ApiModelProperty({ isArray: true })
  readonly rows: UserResponse;
}
