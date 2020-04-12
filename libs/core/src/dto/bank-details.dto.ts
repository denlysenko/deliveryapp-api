import { ApiProperty } from '@nestjs/swagger';

import { BankDetails } from '../interfaces';

export class BankDetailsDto implements BankDetails {
  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly bin: string;

  @ApiProperty()
  readonly accountNumber: string;

  @ApiProperty()
  readonly swift: string;
}
