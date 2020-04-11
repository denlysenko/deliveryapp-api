import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiParam,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  Roles,
  Self,
  LogActions,
  PaymentErrors,
  Role,
  RolesGuard,
  ErrorsInterceptor,
  BaseResponse,
} from '@deliveryapp/common';
import { LogDto, LogsService } from '@deliveryapp/logs';
import { User } from '@deliveryapp/users';

import {
  ValidationError as SequelizeValidationError,
  ValidationErrorItem,
} from 'sequelize';

import { PaymentDto } from './dto/payment.dto';
import { Payment } from './entities/Payment';
import { PaymentsService } from './payments.service';
import { PaymentsQuery } from './queries/payments.query';
import { PaymentResponse as PaymentRes } from './responses/payment.response';
import { PaymentsResponse } from './responses/payments.response';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@UseInterceptors(ErrorsInterceptor)
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly logsService: LogsService,
  ) {}

  /**
   * GET /payments
   */
  @Get()
  @ApiOperation({ summary: 'Get payments' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns payments',
    type: PaymentsResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden Error',
  })
  @Roles(Role.MANAGER, Role.ADMIN)
  async getAll(@Query() query: PaymentsQuery): Promise<BaseResponse<Payment>> {
    return await this.paymentsService.getAll(query);
  }

  /**
   * GET /payments/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get payment' })
  @ApiParam({
    name: 'id',
    description: 'Payment ID',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns order',
    type: PaymentRes,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden Error',
  })
  @Roles(Role.MANAGER, Role.ADMIN)
  async getById(@Param('id') id: number): Promise<Payment> {
    return await this.paymentsService.getById(id);
  }

  /**
   * POST /payments
   */
  @Post()
  @ApiOperation({ summary: 'Create payment' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns created payment',
    type: PaymentRes,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden Error',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation Error',
  })
  @Roles(Role.MANAGER, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async create(@Self() user: User, @Body() paymentDto: PaymentDto) {
    if (!paymentDto.orders || !paymentDto.orders.length) {
      throw new SequelizeValidationError('ValidationError', [
        new ValidationErrorItem(
          PaymentErrors.ORDER_REQUIRED_ERR,
          null,
          'orders',
          null,
        ),
      ]);
    }

    if (!paymentDto.clientId) {
      throw new SequelizeValidationError('ValidationError', [
        new ValidationErrorItem(
          PaymentErrors.CLIENT_REQUIRED_ERR,
          null,
          'client',
          null,
        ),
      ]);
    }

    const payment = await this.paymentsService.create(paymentDto, user.id);

    await this.logsService.create(
      new LogDto({
        action: LogActions.ORDER_CREATE,
        userId: user.id,
        createdAt: new Date(),
        data: {
          id: payment.id,
        },
      }),
    );

    return payment;
  }

  /**
   * PATCH /payments/:id
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update payment' })
  @ApiParam({
    name: 'id',
    description: 'Payment ID',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns update payment',
    type: PaymentRes,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden Error',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation Error',
  })
  @Roles(Role.MANAGER, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async update(
    @Self() user: User,
    @Param('id') id: number,
    @Body() paymentDto: PaymentDto,
  ) {
    const payment = await this.paymentsService.update(id, paymentDto);

    await this.logsService.create(
      new LogDto({
        action: LogActions.PAYMENT_UPDATE,
        userId: user.id,
        createdAt: new Date(),
        data: {
          id: payment.id,
        },
      }),
    );

    return payment;
  }
}
