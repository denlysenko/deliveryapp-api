import { ApiProperty } from '@nestjs/swagger';

export class LogsQuery {
  @ApiProperty({
    description: 'Action',
    required: false,
  })
  readonly 'filter[action]': number;

  @ApiProperty({
    description: 'User ID',
    required: false,
  })
  readonly 'filter[userId]': number;

  @ApiProperty({
    description: 'Creation Date',
    required: false,
  })
  readonly 'order[createdAt]': string;
}
