import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

import { Order, Payment, User } from '../interfaces';
import { UserDto } from './user.dto';

export class PaymentDto implements Payment {
  @ApiProperty()
  readonly id: number;

  @ApiProperty({
    description: 'Payment method CASH = 1, NON_CASH = 2',
    enum: [1, 2],
  })
  readonly method: number;

  @ApiProperty({
    description: 'Payment status',
    enum: [true, false],
  })
  readonly status: boolean;

  @ApiProperty()
  readonly total: number;

  @ApiProperty()
  readonly paymentAmount: number;

  @ApiProperty()
  readonly paymentDate: Date;

  @ApiProperty()
  readonly dueDate: Date;

  @ApiProperty()
  readonly notes: string;

  @ApiProperty()
  readonly description: string;

  @ApiProperty({
    description: 'Array of Order IDS',
  })
  readonly orders: Order[];

  @ApiProperty({
    description: 'Client',
    type: UserDto,
  })
  readonly client: Partial<User>;

  @Exclude()
  readonly creator: Partial<User>;

  @Exclude()
  readonly clientId: number;

  @Exclude()
  readonly creatorId: number;

  @Exclude()
  readonly deletedAt: Date;
}
