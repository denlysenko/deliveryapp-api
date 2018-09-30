import { ApiModelProperty } from '@nestjs/swagger';

export class CompanyAddressDto {
  @ApiModelProperty()
  readonly country: string;

  @ApiModelProperty()
  readonly city: string;

  @ApiModelProperty()
  readonly street: string;

  @ApiModelProperty()
  readonly house: string;
}
