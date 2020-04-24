import { ApiProperty } from '@nestjs/swagger';
import { UserErrors } from '@deliveryapp/common';

import { IsNotEmpty } from 'class-validator';

import { ChangePasswordPayload } from '../interfaces';

export class PasswordDto implements ChangePasswordPayload {
  @IsNotEmpty({ message: UserErrors.PASSWORD_REQUIRED_ERR })
  @ApiProperty()
  readonly oldPassword: string;

  @IsNotEmpty({ message: UserErrors.PASSWORD_REQUIRED_ERR })
  @ApiProperty()
  readonly newPassword: string;
}
