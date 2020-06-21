import { ApiProperty } from '@nestjs/swagger';

import { Exclude } from 'class-transformer';

import { BankDetails } from '../interfaces';

export class BankDetailsDto implements BankDetails {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly bin: string;

  @ApiProperty()
  readonly accountNumber: string;

  @ApiProperty()
  readonly swift: string;

  @Exclude()
  belongsToCompany: boolean;

  constructor(bankDetailsEntity: BankDetails) {
    Object.assign(this, bankDetailsEntity);
  }
}
