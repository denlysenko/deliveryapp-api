import { NotFoundException } from '@nestjs/common';

import { BaseResponse, LogActions, Role } from '@deliveryapp/common';
import { ConfigService } from '@deliveryapp/config';
import {
  BaseQuery,
  CreatePaymentDto,
  Log,
  Payment,
  UpdatePaymentDto,
  User,
} from '@deliveryapp/core';
import { LogsService } from '@deliveryapp/logs';
import { MessagesService } from '@deliveryapp/messages';
import { PaymentEntity } from '@deliveryapp/repository';

import { isNil } from 'lodash';
import { WhereOptions } from 'sequelize';

export class PaymentsService {
  constructor(
    private readonly paymentsRepository: typeof PaymentEntity,
    private readonly configService: ConfigService,
    private readonly messagesService: MessagesService,
    private readonly logsService: LogsService,
  ) {}

  async getPayments(
    query: BaseQuery,
    user: Partial<User>,
  ): Promise<BaseResponse<Payment>> {
    const where: WhereOptions = { ...query.filter };
    const offset = query.offset ?? 0;
    const limit =
      query.limit ?? parseInt(this.configService.get('DEFAULT_LIMIT'), 10);
    const order: [string, string][] = query.order
      ? Object.entries(query.order)
      : [['id', 'desc']];

    const scope = ['order'];

    if (user.role === Role.CLIENT) {
      where.clientId = user.id;
    } else {
      scope.push('client');
    }

    const { count, rows } = await this.paymentsRepository
      .scope(scope)
      .findAndCountAll({
        where,
        limit,
        offset,
        order,
        nest: true,
        distinct: true,
        col: `${PaymentEntity.name}.id`,
      });

    // this transformation to JSON is for fixing sequelize issue when using raw: true
    // https://github.com/sequelize/sequelize/issues/10712
    return {
      count,
      rows: rows.map((row: PaymentEntity) => row.toJSON()),
    };
  }

  async getPayment(id: number, user: Partial<User>): Promise<Payment> {
    const where: WhereOptions = { id };
    const scope = ['order'];

    if (user.role === Role.CLIENT) {
      where.clientId = user.id;
    } else {
      scope.push('client');
    }

    const payment: PaymentEntity = await this.paymentsRepository
      .scope(scope)
      .findOne({ where, nest: true });

    if (isNil(payment)) {
      throw new NotFoundException();
    }

    // this transformation to JSON is for fixing sequelize issue when using raw: true
    // https://github.com/sequelize/sequelize/issues/10712
    return payment.toJSON() as Payment;
  }

  async create(
    paymentDto: CreatePaymentDto,
    user: Partial<User>,
  ): Promise<{ id: number }> {
    const { orders, ...newPayment } = paymentDto;

    const createdPayment = await this.paymentsRepository.sequelize.transaction(
      async (transaction) => {
        const payment: PaymentEntity = await PaymentEntity.create(
          {
            ...newPayment,
            creatorId: user.id,
          },
          { transaction },
        );

        await payment.$set('orders', orders, { transaction });

        return payment;
      },
    );

    await this.logsService.create(
      new Log({
        action: LogActions.ORDER_CREATE,
        userId: user.id,
        createdAt: new Date(),
        data: {
          id: createdPayment.id,
        },
      }),
    );

    // const message = {
    //   text: `New invoice created # ${savedPayment.id}`,
    //   // tslint:disable-next-line:no-string-literal
    //   recipientId: savedPayment['clientId'],
    // };

    // try {
    //   await this.messagesService.saveAndSendToUser(
    //     // tslint:disable-next-line:no-string-literal
    //     savedPayment['clientId'],
    //     message,
    //   );
    // } catch (err) {
    //   // tslint:disable-next-line:no-console
    //   console.error('Error while sending Push', err);
    // }
    return { id: createdPayment.id };
  }

  async update(
    id: number,
    paymentDto: UpdatePaymentDto,
    user: Partial<User>,
  ): Promise<{ id: number }> {
    const payment: PaymentEntity = await this.paymentsRepository.findByPk(id);

    if (isNil(payment)) {
      throw new NotFoundException();
    }

    const updatedPayment = await this.paymentsRepository.sequelize.transaction(
      async (transaction) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { orders, clientId, ...updatedPayment } = paymentDto;
        const promises = [];

        payment.set(updatedPayment);
        promises.push(payment.save({ transaction }));

        if (!isNil(orders) && orders.length > 0) {
          promises.push(payment.$set('orders', orders, { transaction }));
        }

        await Promise.all(promises);

        return payment;
      },
    );

    await this.logsService.create(
      new Log({
        action: LogActions.PAYMENT_UPDATE,
        userId: user.id,
        createdAt: new Date(),
        data: {
          id: payment.id,
        },
      }),
    );

    // const message = {
    //   text: `Invoice # ${payment.id} has been updated`,
    //   // tslint:disable-next-line:no-string-literal
    //   recipientId: payment['clientId'],
    // };

    // try {
    //   await this.messagesService.saveAndSendToUser(
    //     // tslint:disable-next-line:no-string-literal
    //     payment['clientId'],
    //     message,
    //   );
    // } catch (err) {
    //   // tslint:disable-next-line:no-console
    //   console.error('Error while sending Push', err);
    // }

    return { id: updatedPayment.id };
  }
}
