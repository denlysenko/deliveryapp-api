import { BadRequestException, NotFoundException } from '@nestjs/common';

import {
  BaseResponse,
  LogActions,
  OrderErrors,
  Role,
} from '@deliveryapp/common';
import { ConfigService } from '@deliveryapp/config';
import { BaseQuery, Log, Order, User } from '@deliveryapp/core';
import { LogsService } from '@deliveryapp/logs';
import { MessagesService } from '@deliveryapp/messages';
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
    private readonly messagesService: MessagesService,
    private readonly logsService: LogsService,
  ) {}

  async getOrders(
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
    }

    if (user.role !== Role.CLIENT) {
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
    await this.logsService.create(
      new Log({
        action: LogActions.ORDER_CREATE,
        userId: user.id,
        createdAt: new Date(),
        data: {
          id: order.id,
        },
      }),
    );
    // const message = {
    //   text: `New order # ${order.id} created by client ${orderDto.clientId}`,
    //   forEmployee: true,
    // };

    // try {
    //   await this.messagesService.saveAndSendToEmployees(message);
    // } catch (err) {
    //   // tslint:disable-next-line:no-console
    //   console.error('Error while sending Push', err);
    // }

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

    await this.logsService.create(
      new Log({
        action: LogActions.ORDER_UPDATE,
        userId: user.id,
        createdAt: new Date(),
        data: {
          id: order.id,
        },
      }),
    );

    // const message = {
    //   text: `Order # ${order.id} has been updated`,
    //   // tslint:disable-next-line:no-string-literal
    //   recipientId: userRole === Role.CLIENT ? null : order['clientId'],
    //   forEmployee: userRole === Role.CLIENT,
    // };

    // try {
    //   (await (userRole !== Role.CLIENT))
    //     ? this.messagesService.saveAndSendToUser(
    //         // tslint:disable-next-line:no-string-literal
    //         order['clientId'],
    //         message,
    //       )
    //     : this.messagesService.saveAndSendToEmployees(message);
    // } catch (err) {
    //   // tslint:disable-next-line:no-console
    //   console.error('Error while sending Push', err);
    // }
    return { id: order.id };
  }
}
