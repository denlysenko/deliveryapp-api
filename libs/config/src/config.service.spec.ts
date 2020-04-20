import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from './config.service';

const config = {
  key: 'value',
};

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}));

jest.mock('dotenv', () => ({
  parse: jest.fn(() => config),
}));

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should return config value', () => {
      expect(service.get('key')).toEqual(config.key);
    });
  });
});
