import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@deliveryapp/config';
import { LOG_MODEL } from '@deliveryapp/repository';
import { createModel, MockConfigService } from '@deliveryapp/testing';

import { LogsService } from './logs.service';

const log = {
  _id: 'log_id',
  action: 1,
  userId: 1,
  createdAt: new Date('2020-04-12T00:00:00'),
  data: {},
};

const logModel: any = createModel(log);

const logsQuery = {
  filter: { action: 1 },
  order: { createdAt: 'asc' },
  offset: 10,
  limit: 5,
};

describe('LogsService', () => {
  let service: LogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LogsService,
          useFactory: (logModel, configService: ConfigService) =>
            new LogsService(logModel, configService),
          inject: [getModelToken(LOG_MODEL), ConfigService],
        },
        {
          provide: getModelToken(LOG_MODEL),
          useValue: logModel,
        },
        {
          provide: ConfigService,
          useValue: MockConfigService,
        },
      ],
    }).compile();

    service = module.get<LogsService>(LogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create log', async () => {
      expect(await service.create(log)).toEqual(log);
    });
  });

  describe('findAll', () => {
    it('should build cursor', async () => {
      await service.findAll(logsQuery);
      expect(logModel.find).toBeCalledWith(logsQuery.filter);
      expect(logModel.skip).toBeCalledWith(logsQuery.offset);
      expect(logModel.limit).toBeCalledWith(logsQuery.limit);
      expect(logModel.sort).toBeCalledWith(logsQuery.order);
    });

    it('should return logs response', async () => {
      expect(await service.findAll(logsQuery)).toEqual({
        count: 1,
        rows: [log],
      });
    });
  });
});
