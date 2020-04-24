import { ApiProperty, PartialType, OmitType } from '@nestjs/swagger';

import { UserErrors } from '@deliveryapp/common';

import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';

import { BaseResponse, User } from '../interfaces';
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
  readonly role: number;

  @Type(() => AddressDto)
  @ApiProperty()
  address?: AddressDto;

  @Type(() => BankDetailsDto)
  @ApiProperty()
  bankDetails?: BankDetailsDto;

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly updatedAt: Date;

  constructor(userEntity: User) {
    Object.assign(this, userEntity);
  }
}

export class UsersDto implements BaseResponse<User> {
  @ApiProperty()
  readonly count: number;

  @ApiProperty({
    isArray: true,
    type: OmitType(UserDto, ['address', 'bankDetails']),
  })
  readonly rows: UserDto[];
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
  @ApiProperty()
  readonly email: string;

  @IsNotEmpty({
    message: UserErrors.PASSWORD_REQUIRED_ERR,
  })
  @ApiProperty()
  readonly password: string;

  @ApiProperty()
  readonly firstName: string;

  @ApiProperty()
  readonly lastName: string;

  @ApiProperty()
  readonly company: string;

  @ApiProperty()
  readonly phone: string;

  @IsNotEmpty({
    message: UserErrors.ROLE_REQUIRED_ERR,
  })
  @ApiProperty()
  readonly role: number;
}

export class UpdateProfileDto
  extends OmitType(PartialType(CreateUserDto), ['password'])
  implements Partial<User> {
  @ApiProperty()
  address?: AddressDto;

  @ApiProperty()
  bankDetails?: BankDetailsDto;
}

export class UpdateUserDto
  extends OmitType(PartialType(CreateUserDto), ['password'])
  implements Partial<User> {}

export class RegisterUserDto extends OmitType(CreateUserDto, ['role'])
  implements Partial<User> {}
