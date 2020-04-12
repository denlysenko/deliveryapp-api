import { ApiProperty } from '@nestjs/swagger';

import { UserErrors } from '@deliveryapp/common';

import { IsEmail, IsNotEmpty } from 'class-validator';

import { AuthPayload } from '../interfaces';

export class LoginDto {
  @IsNotEmpty({
    message: UserErrors.EMAIL_REQUIRED_ERR,
  })
  @IsEmail(
    {},
    {
      message: UserErrors.INVALID_EMAIL_ERR,
    },
  )
  @ApiProperty(/*{ required: true }*/)
  readonly email: string;

  @IsNotEmpty({
    message: UserErrors.PASSWORD_REQUIRED_ERR,
  })
  @ApiProperty(/*{ required: true }*/)
  readonly password: string;
}

export class AuthPayloadDto implements AuthPayload {
  @ApiProperty()
  readonly token: string;
}

export class LoginErrorDto {
  @ApiProperty()
  readonly message: string;

  @ApiProperty({ type: String, isArray: true })
  readonly fields: string[];
}
