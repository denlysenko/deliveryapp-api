import { Controller, Get, HttpStatus, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiUseTags } from '@nestjs/swagger';
import { Self } from 'common/decorators/self.decorator';
import { ErrorsInterceptor } from 'common/interceptors/errors.interceptor';
import { BaseResponse } from 'common/interfaces/base-response.interface';
import { Payment } from 'payments/entities/Payment';
import { PaymentsService } from 'payments/payments.service';
import { PaymentsQuery } from 'payments/queries/payments.query';
import { PaymentsResponse } from 'payments/responses/payments.response';

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
