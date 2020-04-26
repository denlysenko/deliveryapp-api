import { NotFoundException } from '@nestjs/common';

import {
  LogActions,
  MessageTypes,
  PaymentErrors,
  Role,
} from '@deliveryapp/common';
import { ConfigService } from '@deliveryapp/config';
import {
  BaseQuery,
  BaseResponse,
  CreatePaymentDto,
  Payment,
  UpdatePaymentDto,
  User,
} from '@deliveryapp/core';
import { LogsService } from '@deliveryapp/logs';
import { createMessage, NotificationService } from '@deliveryapp/messages';
import { PaymentEntity } from '@deliveryapp/repository';

import { isNil } from 'lodash';
import { WhereAttributeHash } from 'sequelize';

export class PaymentsService {
  constructor(
    private readonly paymentsRepository: typeof PaymentEntity,
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationService,
    private readonly logsService: LogsService,
  ) {}

  async getPayments(
    query: BaseQuery,
    user: Partial<User>,
  ): Promise<BaseResponse<Payment>> {
    const where: WhereAttributeHash = { ...query.filter };
    const offset = query.offset ?? 0;
    const limit =
      query.limit ?? parseInt(this.configService.get('DEFAULT_LIMIT'), 10);
    const order: [string, string][] = query.order
      ? Object.entries(query.order)
      : [['id', 'desc']];

    const scope = ['order'];

    if (user.role === Role.CLIENT) {
      where.clientId = user.id!;
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
      rows: rows.map((row) => row.toJSON() as Payment),
    };
  }

  async getPayment(id: number, user: Partial<User>): Promise<Payment> {
    const where: WhereAttributeHash = { id };
    const scope = ['order'];

    if (user.role === Role.CLIENT) {
      where.clientId = user.id!;
    } else {
      scope.push('client');
    }

    const payment = await this.paymentsRepository
      .scope(scope)
      .findOne({ where, nest: true });

    if (isNil(payment)) {
      throw new NotFoundException(PaymentErrors.PAYMENT_NOT_FOUND_ERR);
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

    const createdPayment = await this.paymentsRepository.sequelize!.transaction(
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

    Promise.all([
      this.logsService.create({
        action: LogActions.ORDER_CREATE,
        userId: user.id!,
        data: {
          id: createdPayment.id,
        },
      }),
      this.notificationService.sendNotification(
        createMessage(MessageTypes.PAYMENT_CREATE, {
          id: createdPayment.id,
          recipientId: createdPayment.clientId,
        }),
      ),
    ]).catch((err: unknown) => {
      console.error(err);
    });

    return { id: createdPayment.id };
  }

  async update(
    id: number,
    paymentDto: UpdatePaymentDto,
    user: Partial<User>,
  ): Promise<{ id: number }> {
    const payment = await this.paymentsRepository.findByPk(id);

    if (isNil(payment)) {
      throw new NotFoundException(PaymentErrors.PAYMENT_NOT_FOUND_ERR);
    }

    const updatedPayment = await this.paymentsRepository.sequelize!.transaction(
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

    Promise.all([
      this.logsService.create({
        action: LogActions.PAYMENT_UPDATE,
        userId: user.id!,
        data: {
          id: payment.id,
        },
      }),
      this.notificationService.sendNotification(
        createMessage(MessageTypes.PAYMENT_UPDATE, {
          id: updatedPayment.id,
          recipientId: updatedPayment.clientId,
        }),
      ),
    ]).catch((err) => {
      console.log(err);
    });

    return { id: updatedPayment.id };
  }
}
