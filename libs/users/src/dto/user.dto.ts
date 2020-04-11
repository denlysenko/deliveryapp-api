import { ApiProperty } from '@nestjs/swagger';

import { AddressDto } from './address.dto';
import { BankDetailsDto } from './bank-details.dto';

export class UserDto {
  @ApiProperty()
  readonly id: number;

  @ApiProperty({ required: true })
  readonly email: string;

  @ApiProperty({ required: true })
  readonly password: string;

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
}
