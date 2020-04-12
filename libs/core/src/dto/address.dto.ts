import { ApiProperty } from '@nestjs/swagger';

import { Address } from '../interfaces';

export class AddressDto implements Address {
  @ApiProperty()
  readonly country: string;

  @ApiProperty()
  readonly city: string;

  @ApiProperty()
  readonly street: string;

  @ApiProperty()
  readonly house: string;
}
