import { ApiProperty } from '@nestjs/swagger';

import { AddressDto } from '../dto/address.dto';
import { BankDetailsDto } from '../dto/bank-details.dto';

export class UserResponse {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
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

  @ApiProperty()
  readonly address: AddressDto;

  @ApiProperty()
  readonly bankDetails: BankDetailsDto;
}
