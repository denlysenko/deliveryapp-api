import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

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

  describe('getAddress', () => {
    it('should find all company address', async () => {
      await service.getAddress();
      expect(addressEntity.findAll).toBeCalledWith(
        expect.objectContaining({
          where: { belongsToCompany: true },
        }),
      );
    });

    it('should return first address', async () => {
      expect(await service.getAddress()).toEqual(address);
    });
  });

  describe('getBankDetails', () => {
    it('should find all company bank details', async () => {
      await service.getBankDetails();
      expect(bankDetailsEntity.findAll).toBeCalledWith(
        expect.objectContaining({
          where: { belongsToCompany: true },
        }),
      );
    });

    it('should return first bank details', async () => {
      expect(await service.getBankDetails()).toEqual(bankDetails);
    });
  });

  describe('createAddress', () => {
    const addressId = 2;

    beforeEach(() => {
      jest
        .spyOn(AddressEntity, 'create')
        .mockResolvedValue({ ...address, id: addressId });
    });

    it('should create address', async () => {
      await service.createAddress(address, { id: 2 });
      expect(AddressEntity.create).toBeCalledWith({
        ...address,
        belongsToCompany: true,
      });
    });

    it('should create log', async () => {
      await service.createAddress(address, { id: 2 });
      expect(logsService.create).toBeCalledTimes(1);
    });

    it('should return created address id', async () => {
      expect(await service.createAddress(address, { id: 2 })).toEqual({
        id: addressId,
      });
    });
  });

  describe('createBankDetails', () => {
    const bankDetailsId = 3;

    beforeEach(() => {
      jest
        .spyOn(BankDetailsEntity, 'create')
        .mockResolvedValue({ ...bankDetails, id: bankDetailsId });
    });

    it('should create bank details', async () => {
      await service.createBankDetails(bankDetails, { id: 2 });
      expect(BankDetailsEntity.create).toBeCalledWith({
        ...bankDetails,
        belongsToCompany: true,
      });
    });

    it('should create log', async () => {
      await service.createBankDetails(bankDetails, { id: 2 });
      expect(logsService.create).toBeCalledTimes(1);
    });

    it('should return created bank details id', async () => {
      expect(await service.createBankDetails(bankDetails, { id: 2 })).toEqual({
        id: bankDetailsId,
      });
    });
  });

  describe('updateAddress', () => {
    beforeEach(() => {
      jest.spyOn(addressEntity, 'findByPk').mockResolvedValue({
        ...addressEntity,
        ...address,
        id: 1,
      });
    });

    it('should find address', async () => {
      await service.updateAddress(1, address, { id: 2 });
      expect(addressEntity.findByPk).toBeCalledWith(1);
    });

    it('should throw 404 if address is not found', async () => {
      jest.spyOn(addressEntity, 'findByPk').mockResolvedValueOnce(null);

      try {
        await service.updateAddress(1, address, { id: 2 });
      } catch (err) {
        expect(err.status).toEqual(HttpStatus.NOT_FOUND);
      }
    });

    it('should update address', async () => {
      await service.updateAddress(1, address, { id: 2 });
      expect(addressEntity.update).toBeCalledTimes(1);
    });

    it('should create log', async () => {
      await service.updateAddress(1, address, { id: 2 });
      expect(logsService.create).toBeCalledTimes(1);
    });

    it('should return updated address id', async () => {
      expect(await service.updateAddress(1, address, { id: 2 })).toEqual({
        id: 1,
      });
    });
  });

  describe('updateBankDetails', () => {
    beforeEach(() => {
      jest.spyOn(bankDetailsEntity, 'findByPk').mockResolvedValue({
        ...bankDetailsEntity,
        ...bankDetails,
        id: 1,
      });
    });

    it('should find bank details', async () => {
      await service.updateBankDetails(1, bankDetails, { id: 2 });
      expect(bankDetailsEntity.findByPk).toBeCalledWith(1);
    });

    it('should throw 404 if bank details is not found', async () => {
      jest.spyOn(bankDetailsEntity, 'findByPk').mockResolvedValueOnce(null);

      try {
        await service.updateBankDetails(1, bankDetails, { id: 2 });
      } catch (err) {
        expect(err.status).toEqual(HttpStatus.NOT_FOUND);
      }
    });

    it('should update bank details', async () => {
      await service.updateBankDetails(1, bankDetails, { id: 2 });
      expect(bankDetailsEntity.update).toBeCalledTimes(1);
    });

    it('should create log', async () => {
      await service.updateBankDetails(1, bankDetails, { id: 2 });
      expect(logsService.create).toBeCalledTimes(1);
    });

    it('should return updated address id', async () => {
      expect(
        await service.updateBankDetails(1, bankDetails, { id: 2 }),
      ).toEqual({
        id: 1,
      });
    });
  });
});
