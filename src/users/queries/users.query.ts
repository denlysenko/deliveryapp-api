import { ApiModelProperty } from '@nestjs/swagger';

export class UsersQuery {
  @ApiModelProperty({
    description: 'Offset',
    required: false,
  })
  readonly offset: number;

  @ApiModelProperty({
    description: 'Limit',
    required: false,
  })
  readonly limit: number;

  @ApiModelProperty({
    description: 'User ID',
    required: false,
  })
  readonly 'filter[id]': number;

  @ApiModelProperty({
    description: 'Role',
    enum: ['Client', 'Manager', 'Admin'],
    required: false,
  })
  readonly 'filter[role]': number;

  @ApiModelProperty({
    description: 'User email',
    required: false,
  })
  readonly 'filter[email]': string;

  @ApiModelProperty({
    description: 'User First Name',
    required: false,
  })
  readonly 'filter[firstName]': string;

  @ApiModelProperty({
    description: 'User Last Name',
    required: false,
  })
  readonly 'filter[lastName]': string;

  @ApiModelProperty({
    description: 'Order by ID',
    required: false,
  })
  readonly 'order[id]': 'asc' | 'desc';

  @ApiModelProperty({
    description: 'Order by First Name',
    required: false,
  })
  readonly 'order[firstName]': 'asc' | 'desc';

  @ApiModelProperty({
    description: 'Order by Last Name',
    required: false,
  })
  readonly 'order[lastName]': 'asc' | 'desc';
}
