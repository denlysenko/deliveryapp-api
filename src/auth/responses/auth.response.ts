import { ApiModelProperty } from '@nestjs/swagger';

export class AuthResponse {
  @ApiModelProperty()
  readonly token: string;
}

export class AuthError {
  @ApiModelProperty()
  readonly message: string;

  @ApiModelProperty({ type: String, isArray: true })
  readonly fields: string[];
}
