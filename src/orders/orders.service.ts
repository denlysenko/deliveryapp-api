import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'common/enums/repositories.enum';
import { Role } from 'common/enums/roles.enum';
import { BaseResponse } from 'common/interfaces/base-response.interface';
import { ConfigService } from 'config/config.service';
import * as _ from 'lodash';
import { MessagesService } from 'messages/messages.service';
import { Payment } from 'payments/entities/Payment';
import { Op } from 'sequelize';
import { User } from 'users/entities/User';

import { OrderDto } from './dto/order.dto';
import { Order } from './entities/Order';

const USER_ATTRIBUTES = [
  'id',
  'email',
  'firstName',
  'lastName',
  'company',
  'phone',
];

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

@Injectable()
export class OrderService {
  constructor(
    @Inject(Repository.ORDERS) private readonly ordersRepository: typeof Order,
    private readonly configService: ConfigService,
    private readonly messagesService: MessagesService,
  ) {}

  async getAll(
    query?: any,
    userId: number = null,
  ): Promise<BaseResponse<Order>> {
    const where = _.transform(
      query.filter || {},
      (result, value, key: string) => {
        switch (key) {
          case 'id': {
            return value && Object.assign(result, { [key]: value }); // destructuring not working here
          }
        }

        return Object.assign(result, { [key]: { [Op.like]: `%${value}%` } });
      },
      userId ? { clientId: userId } : {},
    );

    const order: Array<[string, string]> = _.toPairs(query.order || {});

    return await this.ordersRepository.findAndCountAll({
      where,
      limit:
        Number(query.limit) || Number(this.configService.get('DEFAULT_LIMIT')),
      offset: Number(query.offset) || 0,
      order: order.length ? order : [['id', 'asc']],
      include: [
        {
          model: User,
          as: 'creator',
          attributes: USER_ATTRIBUTES,
        },
        {
          model: User,
          as: 'client',
          attributes: USER_ATTRIBUTES,
        },
        {
          model: Payment,
        },
      ],
    });
  }

  async getById(id: number): Promise<Order> {
    return await this.ordersRepository.findById(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: USER_ATTRIBUTES,
        },
        {
          model: User,
          as: 'client',
          attributes: USER_ATTRIBUTES,
        },
        {
          model: Payment,
        },
      ],
    });
  }

  async create(orderDto: OrderDto): Promise<Order> {
    const order = await Order.create(orderDto);
    const message = {
      text: `New order # ${order.id} created by client ${orderDto.clientId}`,
      forEmployee: true,
    };

    try {
      await this.messagesService.saveAndSendToEmployees(message);
    } catch (err) {}

    return order;
  }

  async update(
    id: number,
    userRole: number,
    orderDto: OrderDto,
  ): Promise<Order> {
    const order = await this.ordersRepository.findById(id);

    if (!order) {
      throw new NotFoundException();
    }

    order.set(orderDto);

    await order.save(
      userRole === Role.CLIENT
        ? { fields: ROLE_CLIENT_UPDATE_ALLOWED_FIELDS }
        : {},
    );

    const message = {
      text: `Order # ${order.id} has been updated`,
      // tslint:disable-next-line:no-string-literal
      recipientId: userRole === Role.CLIENT ? null : order['clientId'],
      forEmployee: userRole === Role.CLIENT,
    };

    try {
      (await (userRole !== Role.CLIENT))
        ? this.messagesService.saveAndSendToUser(
            // tslint:disable-next-line:no-string-literal
            order['clientId'],
            message,
          )
        : this.messagesService.saveAndSendToEmployees(message);
    } catch (err) {}

    // refetch with includes
    return this.getById(order.id);
  }
}
