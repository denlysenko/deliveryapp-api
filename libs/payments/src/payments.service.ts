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
  ICurrentUser,
  Payment,
} from '@deliveryapp/core';
import { LogsService } from '@deliveryapp/logs';
import { createMessage, NotificationService } from '@deliveryapp/messages';
import { PaymentEntity } from '@deliveryapp/repository';

import { isNil } from 'lodash';
import { WhereAttributeHash } from 'sequelize';

interface CreatePayment
  extends Omit<Payment, 'id' | 'orders' | 'creator' | 'client'> {
  orders: number[];
  clientId: number;
}

export class PaymentsService {
  constructor(
    private readonly paymentsRepository: typeof PaymentEntity,
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationService,
    private readonly logsService: LogsService,
  ) {}

  async findAll(
    query: BaseQuery,
    currentUser: ICurrentUser,
  ): Promise<BaseResponse<Payment>> {
    const where: WhereAttributeHash = { ...query.filter };
    const offset = query.offset ?? 0;
    const limit =
      query.limit ?? parseInt(this.configService.get('DEFAULT_LIMIT'), 10);
    const order: [string, string][] = query.order
      ? Object.entries(query.order)
      : [['id', 'desc']];

    const scope = ['order'];

    if (currentUser.role === Role.CLIENT) {
      where.clientId = currentUser.id;
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

  async findOne(id: number, currentUser: ICurrentUser): Promise<Payment> {
    const where: WhereAttributeHash = { id };
    const scope = ['order'];

    if (currentUser.role === Role.CLIENT) {
      where.clientId = currentUser.id;
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
    paymentDto: CreatePayment,
    currentUser: ICurrentUser,
  ): Promise<{ id: number }> {
    const { orders, ...newPayment } = paymentDto;

    const createdPayment = await this.paymentsRepository.sequelize!.transaction(
      async (transaction) => {
        const payment = await PaymentEntity.create(
          {
            ...newPayment,
            creatorId: currentUser.id,
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
        userId: currentUser.id,
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
    paymentDto: Partial<CreatePayment>,
    currentUser: ICurrentUser,
  ): Promise<{ id: number }> {
    const payment = await this.paymentsRepository.findByPk(id);

    if (isNil(payment)) {
      throw new NotFoundException(PaymentErrors.PAYMENT_NOT_FOUND_ERR);
    }

    const updatedPayment = await this.paymentsRepository.sequelize!.transaction(
      async (transaction) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { orders, ...updatedPayment } = paymentDto;
        const promises = [];

        promises.push(payment.update(updatedPayment, { transaction }));

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
        userId: currentUser.id,
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
    ]).catch((err: unknown) => {
      console.log(err);
    });

    return { id: updatedPayment.id };
  }
}
