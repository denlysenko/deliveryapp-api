import { ApiModelProperty } from '@nestjs/swagger';

export class PasswordDto {
  @ApiModelProperty()
  readonly oldPassword: string;

  @ApiModelProperty()
  readonly newPassword: string;
}
