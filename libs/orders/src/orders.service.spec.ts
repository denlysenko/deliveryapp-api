import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { OrderErrors, Role } from '@deliveryapp/common';
import { ConfigService } from '@deliveryapp/config';
import { LogsService } from '@deliveryapp/logs';
import { NotificationService } from '@deliveryapp/messages';
import { OrderEntity, ORDERS_REPOSITORY } from '@deliveryapp/repository';
import {
  createEntity,
  MockConfigService,
  MockLogsService,
  order,
} from '@deliveryapp/testing';

import { OrderService } from './orders.service';

const orderEntity = createEntity(order);
const DEFAULT_LIMIT = 20;
const orderDto = {
  cityFrom: order.cityFrom,
  cityTo: order.cityTo,
  addressFrom: order.addressFrom,
  addressTo: order.addressTo,
  cargoName: order.cargoName,
  cargoWeight: order.cargoWeight,
  senderEmail: order.senderEmail,
  senderPhone: order.senderPhone,
};

const client = {
  id: 1,
  role: Role.CLIENT,
};

const admin = {
  id: 2,
  role: Role.ADMIN,
};

describe('OrdersService', () => {
  let service: OrderService;
  let configService: ConfigService;
  let logsService: LogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: OrderService,
          useFactory: (
            ordersRepository,
            configService: ConfigService,
            notificationService: NotificationService,
            logsService: LogsService,
          ) =>
            new OrderService(
              ordersRepository,
              configService,
              notificationService,
              logsService,
            ),
          inject: [
            ORDERS_REPOSITORY,
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
          provide: ORDERS_REPOSITORY,
          useValue: orderEntity,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
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

  describe('getOrders', () => {
    let query: any;

    beforeEach(() => {
      query = {
        filter: { cargoName: 'test' },
        limit: 10,
        offset: 10,
        order: { createdAt: 'asc' },
      };
    });

    it('should apply defaults', async () => {
      await service.getOrders({}, admin);
      expect(orderEntity.findAndCountAll).toBeCalledWith(
        expect.objectContaining({
          where: {},
          limit: DEFAULT_LIMIT,
          offset: 0,
          order: [['id', 'desc']],
        }),
      );
    });

    it('should apply passed filters', async () => {
      await service.getOrders(query, admin);
      expect(orderEntity.findAndCountAll).toBeCalledWith(
        expect.objectContaining({
          where: query.filter,
          limit: query.limit,
          offset: query.offset,
          order: Object.entries(query.order),
        }),
      );
    });

    it('should add clientId to query for client', async () => {
      await service.getOrders(query, client);
      expect(orderEntity.findAndCountAll).toBeCalledWith(
        expect.objectContaining({
          where: { ...query.filter, clientId: 2 },
          limit: query.limit,
          offset: query.offset,
          order: Object.entries(query.order),
        }),
      );
    });

    it('should return base response of Order', async () => {
      expect(await service.getOrders(query, client)).toEqual({
        count: 1,
        rows: [order],
      });
    });
  });

  describe('getOrder', () => {
    it('should return order', async () => {
      expect(await service.getOrder(1, admin)).toEqual(order);
    });

    it('should add clientId to query for client', async () => {
      await service.getOrder(1, client);
      expect(orderEntity.findOne).toBeCalledWith(
        expect.objectContaining({
          where: { id: 1, clientId: 2 },
        }),
      );
    });

    it('should throw 404', async () => {
      jest.spyOn(orderEntity, 'findOne').mockResolvedValueOnce(null);

      try {
        await service.getOrder(1, client);
      } catch (err) {
        expect(err.status).toEqual(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('create', () => {
    beforeEach(() => {
      jest
        .spyOn(OrderEntity, 'build')
        .mockReturnValue({ ...orderEntity, id: 3 } as any);
    });

    it('should throw Bad Request if clientId is not passed', async () => {
      try {
        await service.create(orderDto, admin);
      } catch (err) {
        expect(err.message).toEqual(OrderErrors.CLIENT_REQUIRED_ERR);
      }
    });

    it('should build order', async () => {
      await service.create(orderDto, client);
      expect(OrderEntity.build).toBeCalledWith({
        ...orderDto,
        creatorId: 2,
        clientId: 2,
      });
    });

    it('should save order to DB', async () => {
      await service.create(orderDto, client);
      expect(orderEntity.save).toBeCalledTimes(1);
    });

    it('should create log', async () => {
      await service.create(orderDto, client);
      expect(logsService.create).toBeCalledTimes(1);
    });

    it('should return id of created order', async () => {
      expect(await service.create(orderDto, client)).toEqual({
        id: 3,
      });
    });
  });

  describe('update', () => {
    beforeEach(() => {
      jest.spyOn(orderEntity, 'findOne').mockResolvedValue({
        ...orderEntity,
        ...order,
      });
    });

    it('should find order', async () => {
      await service.update(order.id, { cargoName: 'Updated' }, admin);
      expect(orderEntity.findOne).toBeCalledWith({ where: { id: order.id } });
    });

    it('should find order for client', async () => {
      await service.update(order.id, { cargoName: 'Updated' }, client);
      expect(orderEntity.findOne).toBeCalledWith({
        where: { id: order.id, clientId: 2 },
      });
    });

    it('should throw 404', async () => {
      jest.spyOn(orderEntity, 'findOne').mockResolvedValueOnce(null);

      try {
        await service.update(order.id, { cargoName: 'Updated' }, admin);
      } catch (err) {
        expect(err.status).toEqual(HttpStatus.NOT_FOUND);
      }
    });

    it('should update', async () => {
      await service.update(order.id, { cargoName: 'Updated' }, admin);
      expect(orderEntity.update).toBeCalledTimes(1);
    });

    it('should create log', async () => {
      await service.update(order.id, { cargoName: 'Updated' }, admin);
      expect(logsService.create).toBeCalledTimes(1);
    });

    it('should return id of updated order', async () => {
      expect(
        await service.update(order.id, { cargoName: 'Updated' }, admin),
      ).toEqual({
        id: order.id,
      });
    });
  });
});
