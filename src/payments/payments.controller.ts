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
import { ApiBearerAuth, ApiImplicitParam, ApiOperation, ApiResponse, ApiUseTags } from '@nestjs/swagger';
import { Roles } from 'common/decorators/roles.decorator';
import { Self } from 'common/decorators/self.decorator';
import { LogActions } from 'common/enums/logs.enum';
import { Role } from 'common/enums/roles.enum';
import { PaymentErrors } from 'common/enums/validation-errors.enum';
import { RolesGuard } from 'common/guards/roles.guard';
import { ErrorsInterceptor } from 'common/interceptors/errors.interceptor';
import { BaseResponse } from 'common/interfaces/base-response.interface';
import { LogDto } from 'logs/dto/log.dto';
import { LogsService } from 'logs/logs.service';
import { ValidationError as SequelizeValidationError, ValidationErrorItem } from 'sequelize';
import { User } from 'users/entities';

import { PaymentDto } from './dto/payment.dto';
import { Payment } from './entities';
import { PaymentsService } from './payments.service';
import { PaymentsQuery } from './queries/payments.query';
import { PaymentResponse as PaymentRes } from './responses/payment.response';
import { PaymentsResponse } from './responses/payments.response';

@ApiUseTags('payments')
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
  @ApiOperation({ title: 'Get payments' })
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
  @ApiOperation({ title: 'Get payment' })
  @ApiImplicitParam({
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
  @ApiOperation({ title: 'Create payment' })
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
  @ApiOperation({ title: 'Update payment' })
  @ApiImplicitParam({
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
