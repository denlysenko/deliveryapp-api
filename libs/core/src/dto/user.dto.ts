import { ApiProperty, PartialType } from '@nestjs/swagger';

import { UserErrors } from '@deliveryapp/common';
import { UserEntity } from '@deliveryapp/repository';

import { IsEmail, IsNotEmpty } from 'class-validator';

import { User } from '../interfaces';
import { AddressDto } from './address.dto';
import { BankDetailsDto } from './bank-details.dto';

export class UserDto implements User {
  @ApiProperty()
  readonly id: number;

  @ApiProperty({ required: true })
  readonly email: string;

  @ApiProperty()
  readonly firstName: string;

  @ApiProperty()
  readonly lastName: string;

  @ApiProperty()
  readonly company: string;

  @ApiProperty()
  readonly phone: string;

  @ApiProperty()
  address?: AddressDto;

  @ApiProperty()
  bankDetails?: BankDetailsDto;

  constructor(userEntity: UserEntity) {
    Object.assign(this, userEntity);
  }
}

export class CreateUserDto implements User {
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

  @ApiProperty()
  readonly firstName: string;

  @ApiProperty()
  readonly lastName: string;

  @ApiProperty()
  readonly company: string;

  @ApiProperty()
  readonly phone: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto)
  implements Partial<User> {
  @ApiProperty()
  address?: AddressDto;

  @ApiProperty()
  bankDetails?: BankDetailsDto;
}
