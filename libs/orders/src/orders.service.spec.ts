import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { OrderErrors, Role } from '@deliveryapp/common';
import { ConfigService } from '@deliveryapp/config';
import { LogsService } from '@deliveryapp/logs';
import { MessagesService } from '@deliveryapp/messages';
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
            messagesService: MessagesService,
            logsService: LogsService,
          ) =>
            new OrderService(
              ordersRepository,
              configService,
              messagesService,
              logsService,
            ),
          inject: [
            ORDERS_REPOSITORY,
            ConfigService,
            MessagesService,
            LogsService,
          ],
        },
        {
          provide: ConfigService,
          useValue: MockConfigService,
        },
        {
          provide: MessagesService,
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
      await service.getOrders({}, { role: Role.ADMIN });
      expect(orderEntity.findAndCountAll).toBeCalledWith({
        where: {},
        limit: DEFAULT_LIMIT,
        offset: 0,
        order: [['id', 'desc']],
        raw: true,
        nest: true,
      });
    });

    it('should apply passed filters', async () => {
      await service.getOrders(query, { role: Role.ADMIN });
      expect(orderEntity.findAndCountAll).toBeCalledWith({
        where: query.filter,
        limit: query.limit,
        offset: query.offset,
        order: Object.entries(query.order),
        raw: true,
        nest: true,
      });
    });

    it('should add clientId to query for client', async () => {
      await service.getOrders(query, { id: 2, role: Role.CLIENT });
      expect(orderEntity.findAndCountAll).toBeCalledWith({
        where: { ...query.filter, clientId: 2 },
        limit: query.limit,
        offset: query.offset,
        order: Object.entries(query.order),
        raw: true,
        nest: true,
      });
    });
  });

  describe('getOrder', () => {
    it('should return order', async () => {
      expect(await service.getOrder(1, { role: Role.ADMIN })).toEqual(order);
    });

    it('should add clientId to query for client', async () => {
      await service.getOrder(1, { role: Role.CLIENT, id: 2 });
      expect(orderEntity.findOne).toBeCalledWith({
        where: { id: 1, clientId: 2 },
        raw: true,
        nest: true,
      });
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
        await service.create(orderDto, { role: Role.ADMIN });
      } catch (err) {
        expect(err.message).toEqual(OrderErrors.CLIENT_REQUIRED_ERR);
      }
    });

    it('should build order', async () => {
      await service.create(orderDto, { role: Role.CLIENT, id: 2 });
      expect(OrderEntity.build).toBeCalledWith({
        ...orderDto,
        creatorId: 2,
        clientId: 2,
      });
    });

    it('should save order to DB', async () => {
      await service.create(orderDto, { role: Role.CLIENT });
      expect(orderEntity.save).toBeCalledTimes(1);
    });

    it('should create log', async () => {
      await service.create(orderDto, { role: Role.CLIENT });
      expect(logsService.create).toBeCalledTimes(1);
    });

    it('should return id of created order', async () => {
      expect(await service.create(orderDto, { role: Role.CLIENT })).toEqual({
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
      await service.update(
        order.id,
        { cargoName: 'Updated' },
        { role: Role.ADMIN },
      );
      expect(orderEntity.findOne).toBeCalledWith({ where: { id: order.id } });
    });

    it('should find order for client', async () => {
      await service.update(
        order.id,
        { cargoName: 'Updated' },
        { role: Role.CLIENT, id: 2 },
      );
      expect(orderEntity.findOne).toBeCalledWith({
        where: { id: order.id, clientId: 2 },
      });
    });

    it('should throw 404', async () => {
      jest.spyOn(orderEntity, 'findOne').mockResolvedValueOnce(null);

      try {
        await service.update(
          order.id,
          { cargoName: 'Updated' },
          { role: Role.ADMIN },
        );
      } catch (err) {
        expect(err.status).toEqual(HttpStatus.NOT_FOUND);
      }
    });

    it('should update', async () => {
      await service.update(
        order.id,
        { cargoName: 'Updated' },
        { role: Role.ADMIN },
      );
      expect(orderEntity.update).toBeCalledTimes(1);
    });

    it('should create log', async () => {
      await service.update(
        order.id,
        { cargoName: 'Updated' },
        { role: Role.ADMIN },
      );
      expect(logsService.create).toBeCalledTimes(1);
    });

    it('should return id of updated order', async () => {
      expect(
        await service.update(
          order.id,
          { cargoName: 'Updated' },
          { role: Role.ADMIN },
        ),
      ).toEqual({
        id: order.id,
      });
    });
  });
});
