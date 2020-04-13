import { Test, TestingModule } from '@nestjs/testing';

import { AuthErrors } from '@deliveryapp/common';
import { ConfigService } from '@deliveryapp/config';
import { LogsService } from '@deliveryapp/logs';
import { UserEntity, USERS_REPOSITORY } from '@deliveryapp/repository';
import {
  createEntity,
  MockConfigService,
  MockLogsService,
  user,
} from '@deliveryapp/testing';

import * as jwt from 'jsonwebtoken';

import { AuthService } from './auth.service';

const currentUser = {
  ...user,
  authenticate: jest.fn(() => true),
  save: jest.fn().mockResolvedValue({}),
};
const userEntity = createEntity(currentUser);
const email = 'test@test.com';
const password = 'password';
const token = 'jwtToken';

describe('AuthService', () => {
  let service: AuthService;
  let logsService: LogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AuthService,
          useFactory: (
            configService: ConfigService,
            logsService: LogsService,
            usersRepository,
          ) => new AuthService(configService, logsService, usersRepository),
          inject: [ConfigService, LogsService, USERS_REPOSITORY],
        },
        {
          provide: ConfigService,
          useValue: MockConfigService,
        },
        {
          provide: LogsService,
          useValue: MockLogsService,
        },
        {
          provide: USERS_REPOSITORY,
          useValue: userEntity,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    logsService = module.get<LogsService>(LogsService);
    jest.spyOn(jwt, 'sign').mockImplementation(() => token);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should get user from repository', async () => {
      await service.login(email, password);
      expect(userEntity.findOne).toBeCalledTimes(1);
    });

    it('should throw BadRequest if user was not found', async () => {
      jest.spyOn(userEntity, 'findOne').mockResolvedValueOnce(null);

      try {
        await service.login(email, password);
      } catch (err) {
        expect(err.message).toEqual(AuthErrors.INCORRECT_EMAIL_OR_PASSWORD_ERR);
      }
    });

    it('should throw BadRequest if user was not authenticated', async () => {
      jest.spyOn(currentUser, 'authenticate').mockReturnValueOnce(false);

      try {
        await service.login(email, password);
      } catch (err) {
        expect(err.message).toEqual(AuthErrors.INCORRECT_EMAIL_OR_PASSWORD_ERR);
      }
    });

    it('should return access token', async () => {
      expect(await service.login(email, password)).toEqual({ token });
    });
  });

  describe('register', () => {
    let createUserDto: any;

    beforeEach(() => {
      jest.spyOn(UserEntity, 'build').mockReturnValue(currentUser as any);

      createUserDto = {
        email,
        password,
      };
    });

    it('should build user', async () => {
      await service.register(createUserDto);
      expect(UserEntity.build).toBeCalledTimes(1);
    });

    it('should save user to DB', async () => {
      await service.register(createUserDto);
      expect(currentUser.save).toBeCalledTimes(1);
    });

    it('should create log', async () => {
      await service.register(createUserDto);
      expect(logsService.create).toBeCalledTimes(1);
    });

    it('should return access token', async () => {
      expect(await service.register(createUserDto)).toEqual({ token });
    });
  });

  describe('validate', () => {
    it('should get user from repository', async () => {
      await service.validate({ id: 1 });
      expect(userEntity.findByPk).toBeCalledTimes(1);
    });
  });
});
