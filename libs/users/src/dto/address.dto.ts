import { ApiProperty } from '@nestjs/swagger';

export class AddressDto {
  @ApiProperty()
  readonly country: string;

  @ApiProperty()
  readonly city: string;

  @ApiProperty()
  readonly street: string;

  @ApiProperty()
  readonly house: string;
}
