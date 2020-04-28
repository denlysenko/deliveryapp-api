import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { Role } from '@deliveryapp/common';
import { LogsService } from '@deliveryapp/logs';
import {
  AddressEntity,
  ADDRESS_REPOSITORY,
  BankDetailsEntity,
  BANK_DETAILS_REPOSITORY,
} from '@deliveryapp/repository';
import {
  address,
  bankDetails,
  createEntity,
  MockLogsService,
} from '@deliveryapp/testing';

import { SettingsService } from './settings.service';

const addressEntity = createEntity(address);
const bankDetailsEntity = createEntity(bankDetails);

const currentUser = { id: 2, role: Role.ADMIN };

describe('SettingsService', () => {
  let service: SettingsService;
  let logsService: LogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: SettingsService,
          useFactory: (
            addressRepository,
            bankDetailsRepository,
            logsService: LogsService,
          ) =>
            new SettingsService(
              addressRepository,
              bankDetailsRepository,
              logsService,
            ),
          inject: [ADDRESS_REPOSITORY, BANK_DETAILS_REPOSITORY, LogsService],
        },
        {
          provide: LogsService,
          useValue: MockLogsService,
        },
        {
          provide: ADDRESS_REPOSITORY,
          useValue: addressEntity,
        },
        {
          provide: BANK_DETAILS_REPOSITORY,
          useValue: bankDetailsEntity,
        },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
    logsService = module.get<LogsService>(LogsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAddress', () => {
    it('should find all company address', async () => {
      await service.findAddress();
      expect(addressEntity.findAll).toBeCalledWith(
        expect.objectContaining({
          where: { belongsToCompany: true },
        }),
      );
    });

    it('should return first address', async () => {
      expect(await service.findAddress()).toEqual(address);
    });
  });

  describe('findBankDetails', () => {
    it('should find all company bank details', async () => {
      await service.findBankDetails();
      expect(bankDetailsEntity.findAll).toBeCalledWith(
        expect.objectContaining({
          where: { belongsToCompany: true },
        }),
      );
    });

    it('should return first bank details', async () => {
      expect(await service.findBankDetails()).toEqual(bankDetails);
    });
  });

  describe('createAddress', () => {
    const addressId = 2;

    beforeEach(() => {
      jest
        .spyOn(AddressEntity, 'create')
        .mockResolvedValue({ ...address, id: addressId } as any);
    });

    it('should create address', async () => {
      await service.createAddress(address, currentUser);
      expect(AddressEntity.create).toBeCalledWith({
        ...address,
        belongsToCompany: true,
      });
    });

    it('should create log', async () => {
      await service.createAddress(address, currentUser);
      expect(logsService.create).toBeCalledTimes(1);
    });

    it('should return created address id', async () => {
      expect(await service.createAddress(address, currentUser)).toEqual({
        id: addressId,
      });
    });
  });

  describe('createBankDetails', () => {
    const bankDetailsId = 3;

    beforeEach(() => {
      jest
        .spyOn(BankDetailsEntity, 'create')
        .mockResolvedValue({ ...bankDetails, id: bankDetailsId } as any);
    });

    it('should create bank details', async () => {
      await service.createBankDetails(bankDetails, currentUser);
      expect(BankDetailsEntity.create).toBeCalledWith({
        ...bankDetails,
        belongsToCompany: true,
      });
    });

    it('should create log', async () => {
      await service.createBankDetails(bankDetails, currentUser);
      expect(logsService.create).toBeCalledTimes(1);
    });

    it('should return created bank details id', async () => {
      expect(await service.createBankDetails(bankDetails, currentUser)).toEqual(
        {
          id: bankDetailsId,
        },
      );
    });
  });

  describe('updateAddress', () => {
    let findByPkSpy: jest.SpyInstance;

    beforeEach(() => {
      findByPkSpy = jest.spyOn(addressEntity, 'findByPk').mockResolvedValue({
        ...addressEntity,
        ...address,
        id: 1,
      });
    });

    afterEach(() => {
      findByPkSpy.mockRestore();
    });

    it('should find address', async () => {
      await service.updateAddress(1, address, currentUser);
      expect(addressEntity.findByPk).toBeCalledWith(1);
    });

    it('should throw 404 if address is not found', async () => {
      findByPkSpy.mockResolvedValueOnce(null);

      try {
        await service.updateAddress(1, address, currentUser);
      } catch (err) {
        expect(err.status).toEqual(HttpStatus.NOT_FOUND);
      }
    });

    it('should update address', async () => {
      await service.updateAddress(1, address, currentUser);
      expect(addressEntity.update).toBeCalledTimes(1);
    });

    it('should create log', async () => {
      await service.updateAddress(1, address, currentUser);
      expect(logsService.create).toBeCalledTimes(1);
    });

    it('should return updated address id', async () => {
      expect(await service.updateAddress(1, address, currentUser)).toEqual({
        id: 1,
      });
    });
  });

  describe('updateBankDetails', () => {
    let findByPkSpy: jest.SpyInstance;

    beforeEach(() => {
      findByPkSpy = jest
        .spyOn(bankDetailsEntity, 'findByPk')
        .mockResolvedValue({
          ...bankDetailsEntity,
          ...bankDetails,
          id: 1,
        });
    });

    afterEach(() => {
      findByPkSpy.mockRestore();
    });

    it('should find bank details', async () => {
      await service.updateBankDetails(1, bankDetails, currentUser);
      expect(bankDetailsEntity.findByPk).toBeCalledWith(1);
    });

    it('should throw 404 if bank details is not found', async () => {
      findByPkSpy.mockResolvedValueOnce(null);

      try {
        await service.updateBankDetails(1, bankDetails, currentUser);
      } catch (err) {
        expect(err.status).toEqual(HttpStatus.NOT_FOUND);
      }
    });

    it('should update bank details', async () => {
      await service.updateBankDetails(1, bankDetails, currentUser);
      expect(bankDetailsEntity.update).toBeCalledTimes(1);
    });

    it('should create log', async () => {
      await service.updateBankDetails(1, bankDetails, currentUser);
      expect(logsService.create).toBeCalledTimes(1);
    });

    it('should return updated address id', async () => {
      expect(
        await service.updateBankDetails(1, bankDetails, currentUser),
      ).toEqual({
        id: 1,
      });
    });
  });
});
