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
  Self,
  LogActions,
  ErrorsInterceptor,
  BaseResponse,
  ValidationError,
} from '@deliveryapp/common';

import { LogDto, LogsService } from '@deliveryapp/logs';

import {
  OrderDto,
  Order,
  OrderService,
  OrdersQuery,
  OrdersResponse,
} from '@deliveryapp/orders';

import { User } from '../entities/User';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users/self/orders')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(ErrorsInterceptor)
export class UserOrdersController {
  constructor(
    private readonly orderService: OrderService,
    private readonly logsService: LogsService,
  ) {}

  /**
   * GET /users/self/orders
   */
  @Get()
  @ApiOperation({ summary: 'Gets all orders for authenticated user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns orders',
    type: OrdersResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
  })
  async getOrders(
    @Self() user: User,
    @Query() query: OrdersQuery,
  ): Promise<BaseResponse<Order>> {
    return this.orderService.getAll(query, user.id);
  }

  /**
   * POST /users/self/orders
   */
  @Post()
  @ApiOperation({ summary: 'Creates order for authenticated user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns created order',
    type: OrderDto,
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
  async createOrder(
    @Self() user: User,
    @Body() orderDto: OrderDto,
  ): Promise<Order> {
    const order = await this.orderService.create({
      ...orderDto,
      creatorId: user.id,
      clientId: user.id,
    });

    await this.logsService.create(
      new LogDto({
        action: LogActions.ORDER_CREATE,
        userId: user.id,
        createdAt: new Date(),
        data: {
          id: order.id,
        },
      }),
    );

    return order;
  }

  /**
   * PATCH /users/self/orders/:id
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
    description: 'Returns update order',
    type: OrderDto,
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
  async updateOrder(
    @Self() user: User,
    @Param('id') id: number,
    @Body() orderDto: OrderDto,
  ): Promise<Order> {
    const order = await this.orderService.update(id, user.role, orderDto);

    await this.logsService.create(
      new LogDto({
        action: LogActions.ORDER_UPDATE,
        userId: user.id,
        createdAt: new Date(),
        data: {
          id: order.id,
        },
      }),
    );

    return order;
  }
}
