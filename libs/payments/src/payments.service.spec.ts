import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { Role } from '@deliveryapp/common';
import { ConfigService } from '@deliveryapp/config';
import { LogsService } from '@deliveryapp/logs';
import { NotificationService } from '@deliveryapp/messages';
import { PaymentEntity, PAYMENTS_REPOSITORY } from '@deliveryapp/repository';
import {
  createEntity,
  MockConfigService,
  MockLogsService,
  payment,
} from '@deliveryapp/testing';

import { PaymentsService } from './payments.service';

const paymentEntity = createEntity({
  ...payment,
  toJSON: jest.fn(() => payment),
});
const DEFAULT_LIMIT = 20;

describe('PaymentsService', () => {
  let service: PaymentsService;
  let configService: ConfigService;
  let logsService: LogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PaymentsService,
          useFactory: (
            paymentsRepository,
            configService: ConfigService,
            notificationService: NotificationService,
            logsService: LogsService,
          ) =>
            new PaymentsService(
              paymentsRepository,
              configService,
              notificationService,
              logsService,
            ),
          inject: [
            PAYMENTS_REPOSITORY,
            ConfigService,
            NotificationService,
            LogsService,
          ],
        },
        {
          provide: ConfigService,
          useValue: MockConfigService,
        },
        {
          provide: NotificationService,
          useValue: {},
        },
        {
          provide: LogsService,
          useValue: MockLogsService,
        },
        {
          provide: PAYMENTS_REPOSITORY,
          useValue: paymentEntity,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    configService = module.get<ConfigService>(ConfigService);
    logsService = module.get<LogsService>(LogsService);

    jest.spyOn(configService, 'get').mockReturnValue(DEFAULT_LIMIT.toString());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPayments', () => {
    let query: any;

    beforeEach(() => {
      query = {
        filter: { id: 1 },
        limit: 10,
        offset: 10,
        order: { createdAt: 'asc' },
      };
    });

    it('should apply defaults', async () => {
      await service.getPayments({}, { role: Role.ADMIN });
      expect(paymentEntity.findAndCountAll).toBeCalledWith(
        expect.objectContaining({
          where: {},
          limit: DEFAULT_LIMIT,
          offset: 0,
          order: [['id', 'desc']],
        }),
      );
    });

    it('should apply passed filters', async () => {
      await service.getPayments(query, { role: Role.ADMIN });
      expect(paymentEntity.findAndCountAll).toBeCalledWith(
        expect.objectContaining({
          where: query.filter,
          limit: query.limit,
          offset: query.offset,
          order: Object.entries(query.order),
        }),
      );
    });

    it('should add clientId to query for client', async () => {
      await service.getPayments(query, { id: 2, role: Role.CLIENT });
      expect(paymentEntity.findAndCountAll).toBeCalledWith(
        expect.objectContaining({
          where: { ...query.filter, clientId: 2 },
          limit: query.limit,
          offset: query.offset,
          order: Object.entries(query.order),
        }),
      );
    });

    it('should return base response of Payment', async () => {
      expect(
        await service.getPayments(query, { id: 2, role: Role.CLIENT }),
      ).toEqual({ count: 1, rows: [payment] });
    });
  });

  describe('getPayment', () => {
    it('should return order', async () => {
      expect(await service.getPayment(1, { role: Role.ADMIN })).toEqual(
        payment,
      );
    });

    it('should add clientId to query for client', async () => {
      await service.getPayment(1, { role: Role.CLIENT, id: 2 });
      expect(paymentEntity.findOne).toBeCalledWith(
        expect.objectContaining({
          where: { id: 1, clientId: 2 },
        }),
      );
    });

    it('should throw 404', async () => {
      jest.spyOn(paymentEntity, 'findOne').mockResolvedValueOnce(null);

      try {
        await service.getPayment(1, { role: Role.CLIENT, id: 2 });
      } catch (err) {
        expect(err.status).toEqual(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('create', () => {
    const paymentDto = {
      method: 1,
      status: true,
      total: 10,
      paymentAmount: 0,
      paymentDate: new Date('2020-04-20T16:16:51.455Z'),
      dueDate: new Date('2020-04-20T16:16:51.455Z'),
      notes: 'string',
      description: 'string',
      orders: [1],
      clientId: 1,
    };

    beforeEach(() => {
      jest.spyOn(PaymentEntity, 'create').mockResolvedValue({
        ...paymentEntity,
        id: 3,
      } as any);
    });

    it('should create payment', async () => {
      await service.create(paymentDto, { id: 2 });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { orders, ...rest } = paymentDto;
      expect(PaymentEntity.create).toBeCalledWith(
        {
          ...rest,
          creatorId: 2,
        },
        { transaction: undefined },
      );
    });

    it('should associate orders', async () => {
      await service.create(paymentDto, { id: 2 });
      const { orders } = paymentDto;
      expect(paymentEntity.$set).toBeCalledWith('orders', orders, {
        transaction: undefined,
      });
    });

    it('should create log', async () => {
      await service.create(paymentDto, { id: 2 });
      expect(logsService.create).toBeCalledTimes(1);
    });

    it('should return id of created payment', async () => {
      expect(await service.create(paymentDto, { id: 2 })).toEqual({
        id: 3,
      });
    });
  });

  describe('update', () => {
    beforeEach(() => {
      jest.spyOn(paymentEntity, 'findByPk').mockResolvedValue({
        ...paymentEntity,
        ...payment,
      });
    });

    it('should find payment', async () => {
      await service.update(payment.id, { paymentAmount: 5 }, { id: 2 });
      expect(paymentEntity.findByPk).toBeCalledWith(payment.id);
    });

    it('should throw 404', async () => {
      jest.spyOn(paymentEntity, 'findByPk').mockResolvedValueOnce(null);

      try {
        await service.update(payment.id, { paymentAmount: 5 }, { id: 2 });
      } catch (err) {
        expect(err.status).toEqual(HttpStatus.NOT_FOUND);
      }
    });

    it('should update', async () => {
      const updatedPaymentId = await service.update(
        payment.id,
        { paymentAmount: 5 },
        { id: 2 },
      );
      expect(paymentEntity.set).toBeCalledTimes(1);
      expect(updatedPaymentId).toEqual({ id: payment.id });
    });

    it('should update with associations', async () => {
      await service.update(
        payment.id,
        { paymentAmount: 5, orders: [3] },
        { id: 2 },
      );
      expect(paymentEntity.$set).toBeCalledWith('orders', [3], {
        transaction: undefined,
      });
    });

    it('should create log', async () => {
      await service.update(payment.id, { paymentAmount: 5 }, { id: 2 });
      expect(logsService.create).toBeCalledTimes(1);
    });

    it('should return id of updated payment', async () => {
      expect(
        await service.update(payment.id, { paymentAmount: 5 }, { id: 2 }),
      ).toEqual({
        id: payment.id,
      });
    });
  });
});
