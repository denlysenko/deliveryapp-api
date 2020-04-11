import { ApiProperty } from '@nestjs/swagger';

export class CompanyBankDetailsDto {
  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly bin: string;

  @ApiProperty()
  readonly accountNumber: string;

  @ApiProperty()
  readonly swift: string;
}
