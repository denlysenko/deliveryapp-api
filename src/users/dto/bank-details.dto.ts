import { ApiModelProperty } from '@nestjs/swagger';

export class BankDetailsDto {
  @ApiModelProperty()
  readonly name: string;

  @ApiModelProperty()
  readonly bin: string;

  @ApiModelProperty()
  readonly accountNumber: string;

  @ApiModelProperty()
  readonly swift: string;
}
