import { Self } from '@common/decorators';
import { ErrorsInterceptor } from '@common/interceptors';
import { BaseResponse } from '@common/interfaces';

import {
  Controller,
  Get,
  HttpStatus,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiUseTags,
} from '@nestjs/swagger';

import { Payment } from '@payments/entities';
import { PaymentsService } from '@payments/payments.service';
import { PaymentsQuery } from '@payments/queries';
import { PaymentsResponse } from '@payments/responses';

import { User } from '../entities/User';

@ApiUseTags('users')
@ApiBearerAuth()
@Controller('users/self/payments')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(ErrorsInterceptor)
export class UserPaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * GET /users/self/payments
   */
  @Get()
  @ApiOperation({ title: 'Gets all payments for authenticated user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns payments',
    type: PaymentsResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
  })
  async getPayments(
    @Self() user: User,
    @Query() query: PaymentsQuery,
  ): Promise<BaseResponse<Payment>> {
    return await this.paymentsService.getAll(query, user.id);
  }
}
