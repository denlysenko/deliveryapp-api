import { ApiModelProperty } from '@nestjs/swagger';

import { AddressDto } from '../dto/address.dto';
import { BankDetailsDto } from '../dto/bank-details.dto';

export class UserResponse {
  @ApiModelProperty()
  readonly id: number;

  @ApiModelProperty()
  readonly email: string;

  @ApiModelProperty()
  readonly firstName: string;

  @ApiModelProperty()
  readonly lastName: string;

  @ApiModelProperty()
  readonly company: string;

  @ApiModelProperty()
  readonly phone: string;

  @ApiModelProperty()
  readonly role: number;

  @ApiModelProperty()
  readonly address: AddressDto;

  @ApiModelProperty()
  readonly bankDetails: BankDetailsDto;
}
