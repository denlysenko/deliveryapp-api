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
  MockNotificationService,
  payment,
} from '@deliveryapp/testing';

import { PaymentsService } from './payments.service';

const paymentEntity = createEntity({
  ...payment,
  toJSON: jest.fn(() => payment),
});
const DEFAULT_LIMIT = 20;

const admin = {
  id: 2,
  role: Role.ADMIN,
};

const client = {
  id: 1,
  role: Role.CLIENT,
};

describe('PaymentsService', () => {
  let service: PaymentsService;
  let configService: ConfigService;
  let logsService: LogsService;
  let notificationService: NotificationService;

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
          useValue: MockNotificationService,
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
    notificationService = module.get<NotificationService>(NotificationService);

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
      await service.getPayments({}, admin);
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
      await service.getPayments(query, admin);
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
      await service.getPayments(query, client);
      expect(paymentEntity.findAndCountAll).toBeCalledWith(
        expect.objectContaining({
          where: { ...query.filter, clientId: client.id },
          limit: query.limit,
          offset: query.offset,
          order: Object.entries(query.order),
        }),
      );
    });

    it('should return base response of Payment', async () => {
      expect(await service.getPayments(query, client)).toEqual({
        count: 1,
        rows: [payment],
      });
    });
  });

  describe('getPayment', () => {
    it('should return order', async () => {
      expect(await service.getPayment(1, admin)).toEqual(payment);
    });

    it('should add clientId to query for client', async () => {
      await service.getPayment(1, client);
      expect(paymentEntity.findOne).toBeCalledWith(
        expect.objectContaining({
          where: { id: 1, clientId: client.id },
        }),
      );
    });

    it('should throw 404', async () => {
      jest.spyOn(paymentEntity, 'findOne').mockResolvedValueOnce(null);

      try {
        await service.getPayment(1, client);
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
      await service.create(paymentDto, admin);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { orders, ...rest } = paymentDto;
      expect(PaymentEntity.create).toBeCalledWith(
        {
          ...rest,
          creatorId: 2,
        },
        expect.anything(),
      );
    });

    it('should associate orders', async () => {
      await service.create(paymentDto, admin);
      const { orders } = paymentDto;
      expect(paymentEntity.$set).toBeCalledWith('orders', orders, {
        transaction: undefined,
      });
    });

    it('should create log', async () => {
      await service.create(paymentDto, admin);
      expect(logsService.create).toBeCalledTimes(1);
    });

    it('should send notification', async () => {
      await service.create(paymentDto, admin);
      expect(notificationService.sendNotification).toBeCalledTimes(1);
    });

    it('should return id of created payment', async () => {
      expect(await service.create(paymentDto, admin)).toEqual({
        id: 3,
      });
    });
  });

  describe('update', () => {
    let findByPkSpy: jest.SpyInstance;

    beforeEach(() => {
      findByPkSpy = jest.spyOn(paymentEntity, 'findByPk').mockResolvedValue({
        ...paymentEntity,
        ...payment,
      });
    });

    afterEach(() => {
      findByPkSpy.mockRestore();
    });

    it('should find payment', async () => {
      await service.update(payment.id, { paymentAmount: 5 }, admin);
      expect(paymentEntity.findByPk).toBeCalledWith(payment.id);
    });

    it('should throw 404', async () => {
      findByPkSpy.mockResolvedValueOnce(null);

      try {
        await service.update(payment.id, { paymentAmount: 5 }, admin);
      } catch (err) {
        expect(err.status).toEqual(HttpStatus.NOT_FOUND);
      }
    });

    it('should update', async () => {
      const updatedPaymentId = await service.update(
        payment.id,
        { paymentAmount: 5 },
        admin,
      );
      expect(paymentEntity.set).toBeCalledTimes(1);
      expect(updatedPaymentId).toEqual({ id: payment.id });
    });

    it('should update with associations', async () => {
      await service.update(
        payment.id,
        { paymentAmount: 5, orders: [3] },
        admin,
      );
      expect(paymentEntity.$set).toBeCalledWith(
        'orders',
        [3],
        expect.anything(),
      );
    });

    it('should create log', async () => {
      await service.update(payment.id, { paymentAmount: 5 }, admin);
      expect(logsService.create).toBeCalledTimes(1);
    });

    it('should send notification', async () => {
      await service.update(payment.id, { paymentAmount: 5 }, admin);
      expect(notificationService.sendNotification).toBeCalledTimes(1);
    });

    it('should return id of updated payment', async () => {
      expect(
        await service.update(payment.id, { paymentAmount: 5 }, admin),
      ).toEqual({
        id: payment.id,
      });
    });
  });
});
