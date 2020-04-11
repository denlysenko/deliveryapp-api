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
  OrderErrors,
  Role,
  RolesGuard,
  ErrorsInterceptor,
  BaseResponse,
  ValidationError,
} from '@deliveryapp/common';

import { LogDto, LogsService } from '@deliveryapp/logs';
import { User } from '@deliveryapp/users';

import {
  ValidationError as SequelizeValidationError,
  ValidationErrorItem,
} from 'sequelize';

import { OrderDto } from './dto/order.dto';
import { Order } from './entities/Order';
import { OrderService } from './orders.service';
import { OrdersQuery } from './queries/orders.query';
import { OrdersResponse } from './responses/orders.response';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@UseInterceptors(ErrorsInterceptor)
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly orderService: OrderService,
    private readonly logsService: LogsService,
  ) {}

  /**
   * GET /orders
   */
  @Get()
  @ApiOperation({ summary: 'Get orders' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns orders',
    type: OrdersResponse,
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
  async getAll(@Query() query: OrdersQuery): Promise<BaseResponse<Order>> {
    return await this.orderService.getAll(query);
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
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden Error',
  })
  @Roles(Role.MANAGER, Role.ADMIN)
  async getById(@Param('id') id: number): Promise<Order> {
    return await this.orderService.getById(id);
  }

  /**
   * POST /orders
   */
  @Post()
  @ApiOperation({ summary: 'Create order' })
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
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden Error',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation Error',
    type: ValidationError,
  })
  @Roles(Role.MANAGER, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async create(@Self() user: User, @Body() orderDto: OrderDto): Promise<Order> {
    if (!orderDto.clientId) {
      throw new SequelizeValidationError('ValidationError', [
        new ValidationErrorItem(
          OrderErrors.CLIENT_REQUIRED_ERR,
          null,
          'clientId',
          null,
        ),
      ]);
    }

    const order = await this.orderService.create({
      ...orderDto,
      creatorId: user.id,
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
    description: 'Returns update order',
    type: OrderDto,
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
  @Roles(Role.MANAGER, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async update(
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
