import { ApiModelProperty } from '@nestjs/swagger';

import { AddressDto } from './address.dto';
import { BankDetailsDto } from './bank-details.dto';

export class UserDto {
  @ApiModelProperty()
  readonly id: number;

  @ApiModelProperty({ required: true })
  readonly email: string;

  @ApiModelProperty({ required: true })
  readonly password: string;

  @ApiModelProperty()
  readonly firstName: string;

  @ApiModelProperty()
  readonly lastName: string;

  @ApiModelProperty()
  readonly company: string;

  @ApiModelProperty()
  readonly phone: string;

  @ApiModelProperty()
  address?: AddressDto;

  @ApiModelProperty()
  bankDetails?: BankDetailsDto;
}
