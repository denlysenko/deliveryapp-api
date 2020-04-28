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

import { CurrentUser } from '@deliveryapp/common';
import {
  BaseResponse,
  BaseResponseSerializerInterceptor,
  CreateOrderDto,
  ErrorsInterceptor,
  ICurrentUser,
  JwtAuthGuard,
  Order,
  OrderDto,
  OrdersDto,
  SequelizeQueryPipe,
  TransformPipe,
  UpdateOrderDto,
  ValidationError,
  ValidationErrorPipe,
} from '@deliveryapp/core';

import { OrdersQuery } from './orders.query';
import { OrderService } from './orders.service';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(ErrorsInterceptor)
@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * GET /orders
   */
  @Get()
  @ApiOperation({ summary: 'Get orders' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns orders',
    type: OrdersDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
  })
  @ApiQuery({
    name: 'filter[id]',
    description: 'Order ID or Number',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'filter[cityFrom]',
    description: 'City From',
    required: false,
  })
  @ApiQuery({
    name: 'filter[cityTo]',
    description: 'City To',
    required: false,
  })
  @ApiQuery({
    name: 'filter[cargoName]',
    description: 'Cargo Name',
    required: false,
  })
  @ApiQuery({
    name: 'filter[clientId]',
    description: 'Client',
    required: false,
  })
  @ApiQuery({
    name: 'order[id]',
    description: 'Order by ID or Number',
    enum: ['asc', 'desc'],
    required: false,
  })
  @ApiQuery({
    name: 'order[cityFrom]',
    description: 'Order by City From',
    enum: ['asc', 'desc'],
    required: false,
  })
  @ApiQuery({
    name: 'order[cityTo]',
    description: 'Order by City To',
    enum: ['asc', 'desc'],
    required: false,
  })
  @ApiQuery({
    name: 'order[cargoName]',
    description: 'Order by Cargo Name',
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
    @Query() query: OrdersQuery,
    @CurrentUser() user: ICurrentUser,
  ): Promise<BaseResponse<Order>> {
    const { rows, count } = await this.orderService.findAll(query, user);
    return {
      count,
      rows: rows.map((row) => new OrderDto(row)),
    };
  }

  /**
   * GET /orders/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get order' })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns order',
    type: OrderDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found Error',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: ICurrentUser,
  ): Promise<Order> {
    const order = await this.orderService.findOne(id, user);
    return new OrderDto(order);
  }

  /**
   * POST /orders
   */
  @Post()
  @ApiOperation({ summary: 'Create order' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns id of created order',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request Error',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation Error',
    type: ValidationError,
  })
  @HttpCode(HttpStatus.OK)
  @UsePipes(ValidationErrorPipe)
  create(
    @Body() orderDto: CreateOrderDto,
    @CurrentUser() user: ICurrentUser,
  ): Promise<{ id: number }> {
    return this.orderService.create(orderDto, user);
  }

  /**
   * PATCH /orders/:id
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update order' })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns id of updated order',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation Error',
    type: ValidationError,
  })
  @HttpCode(HttpStatus.OK)
  @UsePipes(ValidationErrorPipe)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() orderDto: UpdateOrderDto,
    @CurrentUser() user: ICurrentUser,
  ): Promise<{ id: number }> {
    return this.orderService.update(id, orderDto, user);
  }
}
