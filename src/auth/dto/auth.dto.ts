import { ApiModelProperty } from '@nestjs/swagger';

export class AuthDto {
  @ApiModelProperty()
  readonly email: string;

  @ApiModelProperty()
  readonly password: string;
}
