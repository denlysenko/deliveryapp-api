import { ApiProperty } from '@nestjs/swagger';

export class PasswordDto {
  @ApiProperty()
  readonly oldPassword: string;

  @ApiProperty()
  readonly newPassword: string;
}
