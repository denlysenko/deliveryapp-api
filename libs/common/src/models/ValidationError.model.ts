import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorItem {
  @ApiProperty()
  readonly message: string;

  @ApiProperty()
  readonly type: string;

  @ApiProperty()
  readonly path: string;

  @ApiProperty()
  readonly value: string;

  @ApiProperty()
  readonly origin: string;

  @ApiProperty()
  readonly validatorKey: string;

  @ApiProperty()
  readonly validatorName: string;

  @ApiProperty({ type: String, isArray: true })
  readonly validatorArgs: string[];
}

export class ValidationError {
  @ApiProperty()
  readonly name: string;

  @ApiProperty({ type: ValidationErrorItem, isArray: true })
  readonly errors: ValidationErrorItem[];
}
