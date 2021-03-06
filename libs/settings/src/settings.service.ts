import { NotFoundException } from '@nestjs/common';

import { LogActions, SettingsErrors } from '@deliveryapp/common';
import { Address, BankDetails, ICurrentUser } from '@deliveryapp/core';
import { LogsService } from '@deliveryapp/logs';
import { AddressEntity, BankDetailsEntity } from '@deliveryapp/repository';

export class SettingsService {
  constructor(
    private readonly addressRepository: typeof AddressEntity,
    private readonly bankDetailsRepository: typeof BankDetailsEntity,
    private readonly logsService: LogsService,
  ) {}

  async findAddress(): Promise<Address> {
    const address = await this.addressRepository.findAll({
      where: { belongsToCompany: true },
      raw: true,
    });
    return address[0];
  }

  async findBankDetails(): Promise<BankDetails> {
    const bankDetails = await this.bankDetailsRepository.findAll({
      where: { belongsToCompany: true },
      raw: true,
    });
    return bankDetails[0];
  }

  async createAddress(
    addressDto: Address,
    currentUser: ICurrentUser,
  ): Promise<{ id: number }> {
    const address = await AddressEntity.create({
      ...addressDto,
      belongsToCompany: true,
    });

    this.logsService
      .create({
        action: LogActions.CREATE_COMPANY_ADDRESS,
        userId: currentUser.id,
      })
      .catch((err: unknown) => {
        console.error(err);
      });

    return { id: address.id };
  }

  async updateAddress(
    id: number,
    addressDto: Partial<Address>,
    currentUser: ICurrentUser,
  ): Promise<{ id: number }> {
    const address = await this.addressRepository.findByPk(id);

    if (!address) {
      throw new NotFoundException(SettingsErrors.ADDRESS_NOT_FOUND_ERR);
    }

    await address.update(addressDto);

    this.logsService
      .create({
        action: LogActions.UPDATE_COMPANY_ADDRESS,
        userId: currentUser.id,
      })
      .catch((err: unknown) => {
        console.error(err);
      });

    return { id: address.id };
  }

  async createBankDetails(
    bankDetailsDto: BankDetails,
    currentUser: ICurrentUser,
  ): Promise<{ id: number }> {
    const bankDetails = await BankDetailsEntity.create({
      ...bankDetailsDto,
      belongsToCompany: true,
    });

    this.logsService
      .create({
        action: LogActions.CREATE_COMPANY_BANK_DETAILS,
        userId: currentUser.id,
      })
      .catch((err: unknown) => {
        console.error(err);
      });

    return { id: bankDetails.id };
  }

  async updateBankDetails(
    id: number,
    bankDetailsDto: BankDetails,
    currentUser: ICurrentUser,
  ): Promise<{ id: number }> {
    const bankDetails = await this.bankDetailsRepository.findByPk(id);

    if (!bankDetails) {
      throw new NotFoundException(SettingsErrors.BANK_DETAILS_NOT_FOUND_ERR);
    }

    await bankDetails.update(bankDetailsDto);

    this.logsService
      .create({
        action: LogActions.UPDATE_COMPANY_BANK_DETAILS,
        userId: currentUser.id,
      })
      .catch((err: unknown) => {
        console.error(err);
      });

    return { id: bankDetails.id };
  }
}
