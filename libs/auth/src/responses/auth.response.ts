import { ApiProperty } from '@nestjs/swagger';

export class AuthResponse {
  @ApiProperty()
  readonly token: string;
}

export class AuthError {
  @ApiProperty()
  readonly message: string;

  @ApiProperty({ type: String, isArray: true })
  readonly fields: string[];
}
