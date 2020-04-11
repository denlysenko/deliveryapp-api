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
  ApiTags,
} from '@nestjs/swagger';

import { Self, ErrorsInterceptor, BaseResponse } from '@deliveryapp/common';

import {
  Payment,
  PaymentsService,
  PaymentsQuery,
  PaymentsResponse,
} from '@deliveryapp/payments';

import { User } from '../entities/User';

@ApiTags('users')
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
  @ApiOperation({ summary: 'Gets all payments for authenticated user' })
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
