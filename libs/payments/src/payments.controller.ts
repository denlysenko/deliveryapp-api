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

import { CurrentUser, Role, Roles } from '@deliveryapp/common';
import {
  BaseResponse,
  BaseResponseSerializerInterceptor,
  CreatePaymentDto,
  ErrorsInterceptor,
  ICurrentUser,
  JwtAuthGuard,
  Payment,
  PaymentDto,
  PaymentsDto,
  RolesGuard,
  SequelizeQueryPipe,
  TransformPipe,
  UpdatePaymentDto,
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
    @CurrentUser() user: ICurrentUser,
  ): Promise<BaseResponse<Payment>> {
    const { count, rows } = await this.paymentsService.findAll(query, user);

    return {
      count,
      rows: rows.map((row) => new PaymentDto(row)),
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
    @CurrentUser() user: ICurrentUser,
  ): Promise<Payment> {
    const payment = await this.paymentsService.findOne(id, user);
    return new PaymentDto(payment);
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
    @CurrentUser() user: ICurrentUser,
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
    type: ValidationError,
  })
  @UseGuards(RolesGuard)
  @Roles(Role.MANAGER, Role.ADMIN)
  @UsePipes(ValidationErrorPipe)
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() paymentDto: UpdatePaymentDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.paymentsService.update(id, paymentDto, user);
  }
}
