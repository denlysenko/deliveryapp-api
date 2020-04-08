import { ApiProperty } from '@nestjs/swagger';

export class BankDetailsDto {
  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly bin: string;

  @ApiProperty()
  readonly accountNumber: string;

  @ApiProperty()
  readonly swift: string;
}
