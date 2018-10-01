import { ApiModelProperty } from '@nestjs/swagger';

export class LogsQuery {
  @ApiModelProperty({
    description: 'Action',
    required: false,
  })
  readonly 'filter[action]': number;

  @ApiModelProperty({
    description: 'User ID',
    required: false,
  })
  readonly 'filter[userId]': number;

  @ApiModelProperty({
    description: 'Creation Date',
    required: false,
  })
  readonly 'order[createdAt]': string;
}
