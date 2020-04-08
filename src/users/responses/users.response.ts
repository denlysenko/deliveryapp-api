import { ApiProperty } from '@nestjs/swagger';

import { UserResponse } from './user.response';

export class UsersResponse {
  @ApiProperty()
  readonly count: number;

  @ApiProperty({ isArray: true })
  readonly rows: UserResponse;
}
