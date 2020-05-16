import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { Role } from '@deliveryapp/common';
import { ConfigService } from '@deliveryapp/config';
import { Address, BankDetails, User } from '@deliveryapp/core';
import { LogsService } from '@deliveryapp/logs';
import { UserEntity, USERS_REPOSITORY } from '@deliveryapp/repository';
import {
  createEntity,
  MockConfigService,
  MockLogsService,
  user,
} from '@deliveryapp/testing';

import { Op } from 'sequelize';

import { UsersService } from './users.service';

const userEntity = createEntity(user);
const admin = { id: 2, role: Role.ADMIN };
const DEFAULT_LIMIT = 20;

describe('UsersService', () => {
  let service: UsersService;
  let logsService: LogsService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: USERS_REPOSITORY,
          useValue: userEntity,
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
          provide: UsersService,
          useFactory: (
            usersRepository,
            configService: ConfigService,
            logsService: LogsService,
          ) => new UsersService(usersRepository, configService, logsService),
          inject: [USERS_REPOSITORY, ConfigService, LogsService],
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    logsService = module.get<LogsService>(LogsService);
    configService = module.get<ConfigService>(ConfigService);

    jest.spyOn(configService, 'get').mockReturnValue(DEFAULT_LIMIT.toString());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    beforeEach(() => {
      jest
        .spyOn(UserEntity, 'create')
        .mockResolvedValue({ ...userEntity, id: user.id } as any);
    });

    it('should create user', async () => {
      await service.create(user as User, admin);
      expect(UserEntity.create).toBeCalledWith(user);
    });

    it('should create log', async () => {
      await service.create(user as User, admin);
      expect(logsService.create).toBeCalledTimes(1);
    });

    it('should return id of created user', async () => {
      expect(await service.create(user as User, admin)).toEqual({
        id: user.id,
      });
    });
  });

  describe('updateProfile', () => {
    let findByPkSpy: jest.SpyInstance;

    const profileEntity = {
      ...userEntity,
      id: user.id,
      $create: jest.fn().mockResolvedValue({}),
      address: createEntity({}),
      bankDetails: createEntity({}),
    };

    beforeEach(() => {
      findByPkSpy = jest
        .spyOn(userEntity, 'findByPk')
        .mockResolvedValue(profileEntity);
    });

    afterEach(() => {
      findByPkSpy.mockRestore();
    });

    it('should find user by id', async () => {
      await service.updateProfile(user, { firstName: 'test' });
      expect(userEntity.findByPk).toBeCalledWith(user.id);
    });

    it('should throw 404', async () => {
      findByPkSpy.mockResolvedValueOnce(null);

      try {
        await service.updateProfile(user, { firstName: 'test' });
      } catch (err) {
        expect(err.status).toEqual(HttpStatus.NOT_FOUND);
      }
    });

    it('should update user', async () => {
      await service.updateProfile(user, { firstName: 'test' });
      expect(userEntity.update).toBeCalledTimes(1);
    });

    it('should not create/update address and bank details if user is not client', async () => {
      await service.updateProfile(admin, { firstName: 'test' });
      expect(profileEntity.address.update).toBeCalledTimes(0);
      expect(profileEntity.$create).toBeCalledTimes(0);
      expect(profileEntity.bankDetails.update).toBeCalledTimes(0);
    });

    it('should not create/update address and bank details if address and bank details were not passed', async () => {
      await service.updateProfile(user, { firstName: 'test' });
      expect(profileEntity.address.update).toBeCalledTimes(0);
      expect(profileEntity.$create).toBeCalledTimes(0);
      expect(profileEntity.bankDetails.update).toBeCalledTimes(0);
    });

    it('should not create/update address and bank details if address and bank details were not passed', async () => {
      await service.updateProfile(user, { firstName: 'test' });
      expect(profileEntity.address.update).toBeCalledTimes(0);
      expect(profileEntity.$create).toBeCalledTimes(0);
      expect(profileEntity.bankDetails.update).toBeCalledTimes(0);
    });

    it('should not create/update address and bank details if address and bank details are empty', async () => {
      await service.updateProfile(user, {
        firstName: 'test',
        address: {} as Address,
        bankDetails: {} as BankDetails,
      });
      expect(profileEntity.address.update).toBeCalledTimes(0);
      expect(profileEntity.$create).toBeCalledTimes(0);
      expect(profileEntity.bankDetails.update).toBeCalledTimes(0);
    });

    it('should create address and bank details if address and bank details have not been created before', async () => {
      await service.updateProfile(user, {
        firstName: 'test',
        address: { city: 'City' } as Address,
        bankDetails: { name: 'Name' } as BankDetails,
      });
      expect(profileEntity.$create).toBeCalledTimes(2);
    });

    it('should update address and bank details if address and bank details have been already created', async () => {
      const profileEntity2 = {
        ...userEntity,
        id: user.id,
        $create: jest.fn().mockResolvedValue({}),
        address: { ...createEntity({}), id: 1 },
        bankDetails: { ...createEntity({}), id: 1 },
      };
      findByPkSpy.mockResolvedValue(profileEntity2);

      await service.updateProfile(user, {
        firstName: 'test',
        address: { city: 'City' } as Address,
        bankDetails: { name: 'Name' } as BankDetails,
      });
      expect(profileEntity2.address.update).toBeCalledTimes(1);
      expect(profileEntity2.bankDetails.update).toBeCalledTimes(1);
    });

    it('should create log', async () => {
      await service.updateProfile(user, { firstName: 'test' });
      expect(logsService.create).toBeCalledTimes(1);
    });

    it('should return id of created user', async () => {
      expect(await service.updateProfile(user, { firstName: 'test' })).toEqual({
        id: user.id,
      });
    });
  });

  describe('updateUser', () => {
    let findOneSpy: jest.SpyInstance;

    beforeEach(() => {
      findOneSpy = jest
        .spyOn(userEntity, 'findOne')
        .mockResolvedValue({ ...userEntity, ...user });
    });

    afterEach(() => {
      findOneSpy.mockRestore();
    });

    it('should find user', async () => {
      await service.updateUser(user.id, { firstName: 'Test' }, admin);
      expect(userEntity.findOne).toBeCalledWith({
        where: { id: user.id, role: { [Op.in]: [Role.MANAGER, Role.ADMIN] } },
      });
    });

    it('should throw 404', async () => {
      findOneSpy.mockResolvedValueOnce(null);

      try {
        await service.updateUser(user.id, { firstName: 'Test' }, admin);
      } catch (err) {
        expect(err.status).toEqual(HttpStatus.NOT_FOUND);
      }
    });

    it('should update user', async () => {
      await service.updateUser(user.id, { firstName: 'Test' }, admin);
      expect(userEntity.update).toBeCalledTimes(1);
    });

    it('should create log', async () => {
      await service.updateUser(user.id, { firstName: 'Test' }, admin);
      expect(logsService.create).toBeCalledTimes(1);
    });

    it('should return id of created user', async () => {
      expect(
        await service.updateUser(user.id, { firstName: 'Test' }, admin),
      ).toEqual({ id: user.id });
    });
  });

  describe('changePassword', () => {
    let findByPkSpy: jest.SpyInstance;

    const passwordDto = {
      oldPassword: 'oldPassword',
      newPassword: 'newPassword',
    };

    beforeEach(() => {
      findByPkSpy = jest.spyOn(userEntity, 'findByPk').mockResolvedValue({
        ...userEntity,
        authenticate: jest.fn(() => true),
      });
    });

    afterEach(() => {
      findByPkSpy.mockRestore();
    });

    it('should find user', async () => {
      await service.changePassword(user.id, passwordDto);
      expect(userEntity.findByPk).toBeCalledWith(user.id);
    });

    it('should throw 404', async () => {
      findByPkSpy.mockResolvedValueOnce(null);

      try {
        await service.changePassword(user.id, passwordDto);
      } catch (err) {
        expect(err.status).toEqual(HttpStatus.NOT_FOUND);
      }
    });

    it('should throw 422', async () => {
      findByPkSpy.mockResolvedValueOnce({
        ...userEntity,
        authenticate: jest.fn(() => false),
      });

      try {
        await service.changePassword(user.id, passwordDto);
      } catch (err) {
        expect(err.status).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
      }
    });

    it('should save user', async () => {
      await service.changePassword(user.id, passwordDto);
      expect(userEntity.save).toBeCalledTimes(1);
    });

    it('should create log', async () => {
      await service.changePassword(user.id, passwordDto);
      expect(logsService.create).toBeCalledTimes(1);
    });
  });

  describe('findUsers', () => {
    const defaultFilter = {
      id: { [Op.notIn]: [admin.id] },
    };
    it('should return empty array if filter.id is the same as current user', async () => {
      expect(
        await service.findUsers({ filter: { id: admin.id } }, admin),
      ).toEqual({
        count: 0,
        rows: [],
      });
    });

    it('should apply defaults', async () => {
      await service.findUsers({}, admin);
      expect(userEntity.findAndCountAll).toBeCalledWith(
        expect.objectContaining({
          where: { ...defaultFilter },
          limit: DEFAULT_LIMIT,
          offset: 0,
          order: [['id', 'desc']],
        }),
      );
    });

    it('should apply passed filters', async () => {
      const query = {
        filter: { firstName: 'test' },
        limit: 10,
        offset: 10,
        order: { createdAt: 'asc' },
      };

      await service.findUsers(query, admin);

      expect(userEntity.findAndCountAll).toBeCalledWith(
        expect.objectContaining({
          where: { ...defaultFilter, ...query.filter },
          limit: query.limit,
          offset: query.offset,
          order: Object.entries(query.order),
        }),
      );
    });

    it('should return base response of User', async () => {
      expect(await service.findUsers({}, admin)).toEqual({
        count: 1,
        rows: [user],
      });
    });
  });

  describe('findUser', () => {
    let findByPkSpy: jest.SpyInstance;

    beforeEach(() => {
      findByPkSpy = jest.spyOn(userEntity, 'findByPk').mockResolvedValue(user);
    });

    afterEach(() => {
      findByPkSpy.mockRestore();
    });

    it('should throw 404 if passed id is equal to current user', async () => {
      try {
        await service.findUser(admin.id, admin);
      } catch (err) {
        expect(err.status).toEqual(HttpStatus.NOT_FOUND);
      }
    });

    it('should find user', async () => {
      await service.findUser(user.id, admin);
      expect(userEntity.findByPk).toBeCalledWith(user.id, expect.anything());
    });

    it('should throw 404', async () => {
      findByPkSpy.mockResolvedValueOnce(null);

      try {
        await service.findUser(user.id, admin);
      } catch (err) {
        expect(err.status).toEqual(HttpStatus.NOT_FOUND);
      }
    });

    it('should return found user', async () => {
      expect(await service.findUser(user.id, admin)).toEqual(user);
    });
  });

  describe('findProfile', () => {
    let findByPkSpy: jest.SpyInstance;

    beforeEach(() => {
      findByPkSpy = jest.spyOn(userEntity, 'findByPk').mockResolvedValue({
        ...admin,
        toJSON: jest.fn(() => admin),
      });
    });

    afterEach(() => {
      findByPkSpy.mockRestore();
    });

    it('should find profile', async () => {
      await service.findProfile(admin);
      expect(userEntity.findByPk).toBeCalledWith(admin.id, expect.anything());
    });

    it('should throw 404', async () => {
      findByPkSpy.mockResolvedValueOnce(null);

      try {
        await service.findProfile(admin);
      } catch (err) {
        expect(err.status).toEqual(HttpStatus.NOT_FOUND);
      }
    });

    it('should return found profile', async () => {
      expect(await service.findProfile(admin)).toEqual(admin);
    });
  });
});
