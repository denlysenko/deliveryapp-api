import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BaseResponse } from 'common/interfaces/base-response.interface';
import { ConfigService } from 'config/config.service';
import * as _ from 'lodash';
import { MessagesService } from 'messages/messages.service';
import { Order } from 'orders/entities';
import { Sequelize } from 'sequelize';
import { User } from 'users/entities';

import { PaymentDto } from './dto/payment.dto';
import { Payment } from './entities';

const USER_ATTRIBUTES = [
  'id',
  'email',
  'firstName',
  'lastName',
  'company',
  'phone',
];

@Injectable()
export class PaymentsService {
  constructor(
    @Inject('PaymentsRepository')
    private readonly paymentsRepository: typeof Payment,
    @Inject('Sequelize') private readonly sequelize: Sequelize,
    private readonly configService: ConfigService,
    private readonly messagesService: MessagesService,
  ) {}

  async getAll(
    query?: any,
    userId: number = null,
  ): Promise<BaseResponse<Payment>> {
    const where = _.transform(
      query.filter || {},
      (result, value, key: string) => {
        switch (key) {
          case 'id': {
            return value && Object.assign(result, { [key]: value }); // destructuring not working here
          }
        }
      },
      userId ? { clientId: userId } : {},
    );

    const order: Array<[string, string]> = _.toPairs(query.order || {});

    return await this.paymentsRepository.findAndCountAll({
      where,
      limit:
        Number(query.limit) || Number(this.configService.get('DEFAULT_LIMIT')),
      offset: Number(query.offset) || 0,
      order: order.length ? order : [['id', 'asc']],
      include: [
        { model: Order },
        { model: User, as: 'client', attributes: USER_ATTRIBUTES },
        { model: User, as: 'creator', attributes: USER_ATTRIBUTES },
      ],
    });
  }

  async getById(id: number): Promise<Payment> {
    return await this.paymentsRepository.findById(id, {
      include: [
        { model: Order },
        { model: User, as: 'client', attributes: USER_ATTRIBUTES },
        { model: User, as: 'creator', attributes: USER_ATTRIBUTES },
      ],
    });
  }

  async create(paymentDto: PaymentDto, userId: number): Promise<Payment> {
    const savedPayment = await this.sequelize.transaction(async transaction => {
      const { orders, ...createdPayment } = paymentDto;
      const payment = await Payment.create(
        {
          ...createdPayment,
          creatorId: userId,
        },
        { transaction },
      );

      if (orders && orders.length) {
        await payment.$set('Orders', orders, { transaction });
      }

      return payment;
    });

    const message = {
      text: `New invoice created # ${savedPayment.id}`,
      // tslint:disable-next-line:no-string-literal
      recipientId: savedPayment['clientId'],
    };

    try {
      await this.messagesService.saveAndSendToUser(
        // tslint:disable-next-line:no-string-literal
        savedPayment['clientId'],
        message,
      );
    } catch (err) {}

    // refetch with associations
    return this.getById(savedPayment.id);
  }

  async update(id: number, paymentDto: PaymentDto): Promise<Payment> {
    const payment = await this.paymentsRepository.findById(id);

    if (!payment) {
      throw new NotFoundException();
    }

    await this.sequelize.transaction(async transaction => {
      const { orders, clientId, ...updatedPayment } = paymentDto;
      const promises = [];

      payment.set(updatedPayment);
      promises.push(payment.save({ transaction }));

      if (orders && orders.length) {
        promises.push(payment.$set('Orders', orders, { transaction }));
      }

      await Promise.all(promises);
    });

    const message = {
      text: `Invoice # ${payment.id} has been updated`,
      // tslint:disable-next-line:no-string-literal
      recipientId: payment['clientId'],
    };

    try {
      await this.messagesService.saveAndSendToUser(
        // tslint:disable-next-line:no-string-literal
        payment['clientId'],
        message,
      );
    } catch (err) {}

    // refetch with associations
    return this.getById(id);
  }
}
