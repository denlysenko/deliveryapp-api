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
import { Self } from 'common/decorators/self.decorator';
import { LogActions } from 'common/enums/logs.enum';
import { ErrorsInterceptor } from 'common/interceptors/errors.interceptor';
import { BaseResponse } from 'common/interfaces/base-response.interface';
import { ValidationError } from 'common/models/ValidationError.model';
import { LogDto } from 'logs/dto/log.dto';
import { LogsService } from 'logs/logs.service';
import { OrderDto } from 'orders/dto/order.dto';
import { Order } from 'orders/entities';
import { OrderService } from 'orders/orders.service';
import { OrdersQuery } from 'orders/queries/orders.query';
import { OrdersResponse } from 'orders/responses/orders.response';

import { User } from '../entities';

@ApiUseTags('users')
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
  @ApiOperation({ title: 'Gets all orders for authenticated user' })
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
  @ApiOperation({ title: 'Creates order for authenticated user' })
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
  @ApiOperation({ title: 'Update order' })
  @ApiImplicitParam({
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
