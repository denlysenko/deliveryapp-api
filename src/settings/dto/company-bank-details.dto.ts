import { ApiModelProperty } from '@nestjs/swagger';

export class CompanyBankDetailsDto {
  @ApiModelProperty()
  readonly name: string;

  @ApiModelProperty()
  readonly bin: string;

  @ApiModelProperty()
  readonly accountNumber: string;

  @ApiModelProperty()
  readonly swift: string;
}
