import { BadRequestException, NotFoundException } from '@nestjs/common';

import {
  LogActions,
  MessageTypes,
  OrderErrors,
  Role,
} from '@deliveryapp/common';
import { ConfigService } from '@deliveryapp/config';
import {
  BaseQuery,
  BaseResponse,
  ICurrentUser,
  Order,
} from '@deliveryapp/core';
import { LogsService } from '@deliveryapp/logs';
import { createMessage, NotificationService } from '@deliveryapp/messages';
import { OrderEntity } from '@deliveryapp/repository';

import { isNil } from 'lodash';
import { WhereAttributeHash } from 'sequelize';

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

  findAll(
    query: BaseQuery,
    currentUser: ICurrentUser,
  ): Promise<BaseResponse<Order>> {
    const where: WhereAttributeHash = { ...query.filter };
    const offset = query.offset ?? 0;
    const limit =
      query.limit ?? parseInt(this.configService.get('DEFAULT_LIMIT'), 10);
    const order: [string, string][] = query.order
      ? Object.entries(query.order)
      : [['id', 'desc']];

    const scope = currentUser.role === Role.CLIENT ? undefined : 'client';

    if (currentUser.role === Role.CLIENT) {
      where.clientId = currentUser.id;
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

  async findOne(id: number, currentUser: ICurrentUser): Promise<Order> {
    const where: WhereAttributeHash = { id };
    const scope = ['payment'];

    if (currentUser.role === Role.CLIENT) {
      where.clientId = currentUser.id;
    } else {
      scope.push('client');
    }

    const order = await this.ordersRepository
      .scope(scope)
      .findOne({ where, raw: true, nest: true });

    if (isNil(order)) {
      throw new NotFoundException(OrderErrors.ORDER_NOT_FOUND_ERR);
    }

    return order;
  }

  async create(
    orderDto: Order,
    currentUser: ICurrentUser,
  ): Promise<{ id: number }> {
    if (currentUser.role !== Role.CLIENT && !orderDto.clientId) {
      throw new BadRequestException(OrderErrors.CLIENT_REQUIRED_ERR);
    }

    const newOrder = { ...orderDto, creatorId: currentUser.id };

    if (currentUser.role === Role.CLIENT) {
      newOrder.clientId = currentUser.id;
    }

    const order = await OrderEntity.create(newOrder);

    Promise.all([
      this.logsService.create({
        action: LogActions.ORDER_CREATE,
        userId: currentUser.id,
        data: {
          id: order.id,
        },
      }),
      this.notificationService.sendNotification(
        createMessage(MessageTypes.ORDER_CREATE, { id: order.id }),
      ),
    ]).catch((err: unknown) => {
      console.error(err);
    });

    return { id: order.id };
  }

  async update(
    id: number,
    orderDto: Partial<Order>,
    currentUser: ICurrentUser,
  ): Promise<{ id: number }> {
    const where: WhereAttributeHash = { id };

    if (currentUser.role === Role.CLIENT) {
      where.clientId = currentUser.id;
    }

    const order = await this.ordersRepository.findOne({ where });

    if (isNil(order)) {
      throw new NotFoundException(OrderErrors.ORDER_NOT_FOUND_ERR);
    }

    await order.update(
      orderDto,
      currentUser.role === Role.CLIENT
        ? { fields: ROLE_CLIENT_UPDATE_ALLOWED_FIELDS }
        : {},
    );

    Promise.all([
      this.logsService.create({
        action: LogActions.ORDER_UPDATE,
        userId: currentUser.id,
        data: {
          id: order.id,
        },
      }),
      this.notificationService.sendNotification(
        createMessage(MessageTypes.ORDER_UPDATE, {
          id: order.id,
          recipientId:
            currentUser.role === Role.CLIENT ? undefined : currentUser.id,
        }),
      ),
    ]).catch((err: unknown) => {
      console.error(err);
    });

    return { id: order.id };
  }
}
