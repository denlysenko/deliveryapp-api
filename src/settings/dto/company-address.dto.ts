import { ApiProperty } from '@nestjs/swagger';

export class CompanyAddressDto {
  @ApiProperty()
  readonly country: string;

  @ApiProperty()
  readonly city: string;

  @ApiProperty()
  readonly street: string;

  @ApiProperty()
  readonly house: string;
}
