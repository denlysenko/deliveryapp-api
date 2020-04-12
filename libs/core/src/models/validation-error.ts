import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorItem {
  @ApiProperty()
  readonly message: string[];

  @ApiProperty()
  readonly path: string;

  @ApiProperty()
  readonly value: string;

  constructor(messages: string[], path: string, value: string) {
    this.message = messages;
    this.path = path;
    this.value = value;
  }
}

export class ValidationError {
  @ApiProperty()
  readonly name: string;

  @ApiProperty({ type: ValidationErrorItem, isArray: true })
  readonly errors: ValidationErrorItem[];

  constructor(name: string, errors: ValidationErrorItem[]) {
    this.name = name;
    this.errors = errors;
  }
}
