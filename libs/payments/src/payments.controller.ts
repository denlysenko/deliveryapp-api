import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { BaseResponse, CurrentUser, Role, Roles } from '@deliveryapp/common';
import {
  BaseResponseSerializerInterceptor,
  CreatePaymentDto,
  ErrorsInterceptor,
  JwtAuthGuard,
  Payment,
  PaymentDto,
  PaymentsDto,
  RolesGuard,
  SequelizeQueryPipe,
  TransformPipe,
  UpdatePaymentDto,
  User,
  ValidationError,
  ValidationErrorPipe,
} from '@deliveryapp/core';

import { PaymentsQuery } from './payments.query';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(ErrorsInterceptor)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * GET /payments
   */
  @Get()
  @ApiOperation({ summary: 'Get payments' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns payments',
    type: PaymentsDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
  })
  @ApiQuery({
    name: 'filter[id]',
    type: Number,
    description: 'Payment ID or Number',
    required: false,
  })
  @ApiQuery({
    name: 'order[status]',
    description: 'Order by Status',
    enum: ['asc', 'desc'],
    required: false,
  })
  @ApiQuery({
    name: 'order[total]',
    description: 'Order by Total',
    enum: ['asc', 'desc'],
    required: false,
  })
  @ApiQuery({
    name: 'order[createdAt]',
    description: 'Order by Creation Date',
    enum: ['asc', 'desc'],
    required: false,
  })
  @ApiQuery({
    name: 'offset',
    description: 'Offset',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Limit',
    type: Number,
    required: false,
  })
  @UsePipes(SequelizeQueryPipe)
  @UsePipes(TransformPipe)
  @UseInterceptors(BaseResponseSerializerInterceptor)
  async getAll(
    @Query() query: PaymentsQuery,
    @CurrentUser() user: Partial<User>,
  ): Promise<BaseResponse<Payment>> {
    const { count, rows } = await this.paymentsService.getPayments(query, user);

    return {
      count,
      // this transformation to JSON is for fixing sequelize issue when using raw: true
      // https://github.com/sequelize/sequelize/issues/10712
      rows: rows.map((row: any) => new PaymentDto(row.toJSON())),
    };
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
    type: PaymentDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found Error',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: Partial<User>,
  ): Promise<Payment> {
    const payment = await this.paymentsService.getPayment(id, user);
    // this transformation to JSON is for fixing sequelize issue when using raw: true
    // https://github.com/sequelize/sequelize/issues/10712
    return new PaymentDto((payment as any).toJSON());
  }

  /**
   * POST /payments
   */
  @Post()
  @ApiOperation({ summary: 'Create payment' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns ID of created payment',
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
    type: ValidationError,
  })
  @UseGuards(RolesGuard)
  @Roles(Role.MANAGER, Role.ADMIN)
  @UsePipes(ValidationErrorPipe)
  @HttpCode(HttpStatus.OK)
  create(
    @Body() paymentDto: CreatePaymentDto,
    @CurrentUser() user: Partial<User>,
  ) {
    return this.paymentsService.create(paymentDto, user);
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
    description: 'Returns ID of updated payment',
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
  @UseGuards(RolesGuard)
  @Roles(Role.MANAGER, Role.ADMIN)
  @UsePipes(ValidationErrorPipe)
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() paymentDto: UpdatePaymentDto,
    @CurrentUser() user: Partial<User>,
  ) {
    return this.paymentsService.update(id, paymentDto, user);
  }
}
