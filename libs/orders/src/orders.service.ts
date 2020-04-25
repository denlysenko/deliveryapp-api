import { BadRequestException, NotFoundException } from '@nestjs/common';

import {
  BaseResponse,
  LogActions,
  MessageTypes,
  OrderErrors,
  Role,
} from '@deliveryapp/common';
import { ConfigService } from '@deliveryapp/config';
import { BaseQuery, Log, Order, User } from '@deliveryapp/core';
import { LogsService } from '@deliveryapp/logs';
import { createMessage, NotificationService } from '@deliveryapp/messages';
import { OrderEntity } from '@deliveryapp/repository';

import { isNil } from 'lodash';
import { WhereOptions } from 'sequelize';

const ROLE_CLIENT_UPDATE_ALLOWED_FIELDS = [
  'cityFrom',
  'cityTo',
  'addressFrom',
  'addressTo',
  'cargoName',
  'additionalData',
  'comment',
  'cargoWeight',
  'cargoVolume',
  'senderName',
  'senderCompany',
  'senderEmail',
  'senderPhone',
];

export class OrderService {
  constructor(
    private readonly ordersRepository: typeof OrderEntity,
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationService,
    private readonly logsService: LogsService,
  ) {}

  getOrders(
    query: BaseQuery,
    user: Partial<User>,
  ): Promise<BaseResponse<Order>> {
    const where: WhereOptions = { ...query.filter };
    const offset = query.offset ?? 0;
    const limit =
      query.limit ?? parseInt(this.configService.get('DEFAULT_LIMIT'), 10);
    const order: [string, string][] = query.order
      ? Object.entries(query.order)
      : [['id', 'desc']];

    const scope = user.role === Role.CLIENT ? null : 'client';

    if (user.role === Role.CLIENT) {
      where.clientId = user.id;
    }

    return this.ordersRepository.scope(scope).findAndCountAll({
      where,
      limit,
      offset,
      order,
      raw: true,
      nest: true,
    });
  }

  async getOrder(id: number, user: Partial<User>): Promise<Order> {
    const where: WhereOptions = { id };
    const scope = ['payment'];

    if (user.role === Role.CLIENT) {
      where.clientId = user.id;
    } else {
      scope.push('client');
    }

    const order = await this.ordersRepository
      .scope(scope)
      .findOne({ where, raw: true, nest: true });

    if (isNil(order)) {
      throw new NotFoundException();
    }

    return order;
  }

  async create(orderDto: Order, user: Partial<User>): Promise<{ id: number }> {
    if (user.role !== Role.CLIENT && !orderDto.clientId) {
      throw new BadRequestException(OrderErrors.CLIENT_REQUIRED_ERR);
    }

    const newOrder = { ...orderDto, creatorId: user.id };

    if (user.role === Role.CLIENT) {
      newOrder.clientId = user.id;
    }

    const order = OrderEntity.build(newOrder);

    await order.save();

    Promise.all([
      this.logsService.create(
        new Log({
          action: LogActions.ORDER_CREATE,
          userId: user.id,
          data: {
            id: order.id,
          },
        }),
      ),
      this.notificationService.sendNotification(
        createMessage(MessageTypes.ORDER_CREATE, { id: order.id }),
      ),
    ]).catch((err) => {
      console.error(err);
    });

    return { id: order.id };
  }

  async update(
    id: number,
    orderDto: Partial<Order>,
    user: Partial<User>,
  ): Promise<{ id: number }> {
    const where: WhereOptions = { id };

    if (user.role === Role.CLIENT) {
      where.clientId = user.id;
    }

    const order: OrderEntity = await this.ordersRepository.findOne({ where });

    if (isNil(order)) {
      throw new NotFoundException();
    }

    await order.update(
      orderDto,
      user.role === Role.CLIENT
        ? { fields: ROLE_CLIENT_UPDATE_ALLOWED_FIELDS }
        : {},
    );

    Promise.all([
      this.logsService.create(
        new Log({
          action: LogActions.ORDER_UPDATE,
          userId: user.id,
          data: {
            id: order.id,
          },
        }),
      ),
      this.notificationService.sendNotification(
        createMessage(MessageTypes.ORDER_UPDATE, {
          id: order.id,
          recipientId: user.role === Role.CLIENT ? undefined : user.id,
        }),
      ),
    ]).catch((err) => {
      console.error(err);
    });

    return { id: order.id };
  }
}
