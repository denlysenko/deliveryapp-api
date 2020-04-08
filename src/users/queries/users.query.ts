import { ApiProperty } from '@nestjs/swagger';

export class UsersQuery {
  @ApiProperty({
    description: 'Offset',
    required: false,
  })
  readonly offset: number;

  @ApiProperty({
    description: 'Limit',
    required: false,
  })
  readonly limit: number;

  @ApiProperty({
    description: 'User ID',
    required: false,
  })
  readonly 'filter[id]': number;

  @ApiProperty({
    description: 'Role',
    enum: ['Client', 'Manager', 'Admin'],
    required: false,
  })
  readonly 'filter[role]': number;

  @ApiProperty({
    description: 'User email',
    required: false,
  })
  readonly 'filter[email]': string;

  @ApiProperty({
    description: 'User First Name',
    required: false,
  })
  readonly 'filter[firstName]': string;

  @ApiProperty({
    description: 'User Last Name',
    required: false,
  })
  readonly 'filter[lastName]': string;

  @ApiProperty({
    description: 'Order by ID',
    required: false,
  })
  readonly 'order[id]': 'asc' | 'desc';

  @ApiProperty({
    description: 'Order by First Name',
    required: false,
  })
  readonly 'order[firstName]': 'asc' | 'desc';

  @ApiProperty({
    description: 'Order by Last Name',
    required: false,
  })
  readonly 'order[lastName]': 'asc' | 'desc';
}
