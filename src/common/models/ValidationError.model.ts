import { ApiModelProperty } from '@nestjs/swagger';

export class ValidationErrorItem {
  @ApiModelProperty()
  readonly message: string;

  @ApiModelProperty()
  readonly type: string;

  @ApiModelProperty()
  readonly path: string;

  @ApiModelProperty()
  readonly value: string;

  @ApiModelProperty()
  readonly origin: string;

  @ApiModelProperty()
  readonly validatorKey: string;

  @ApiModelProperty()
  readonly validatorName: string;

  @ApiModelProperty({ type: String, isArray: true })
  readonly validatorArgs: string[];
}

export class ValidationError {
  @ApiModelProperty()
  readonly name: string;

  @ApiModelProperty({ type: ValidationErrorItem, isArray: true })
  readonly errors: ValidationErrorItem[];
}
