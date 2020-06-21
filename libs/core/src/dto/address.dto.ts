import { ApiProperty } from '@nestjs/swagger';

import { Exclude } from 'class-transformer';

import { Address } from '../interfaces';

export class AddressDto implements Address {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly country: string;

  @ApiProperty()
  readonly city: string;

  @ApiProperty()
  readonly street: string;

  @ApiProperty()
  readonly house: string;

  @Exclude()
  belongsToCompany: boolean;

  @Exclude()
  userId: number;

  @Exclude()
  createdAt: string;

  @Exclude()
  updatedAt: string;

  constructor(addressEntity: Address) {
    Object.assign(this, addressEntity);
  }
}
