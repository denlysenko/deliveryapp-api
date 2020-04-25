import { NotFoundException } from '@nestjs/common';

import { LogActions } from '@deliveryapp/common';
import { Address, BankDetails, User } from '@deliveryapp/core';
import { LogsService } from '@deliveryapp/logs';
import { AddressEntity, BankDetailsEntity } from '@deliveryapp/repository';

export class SettingsService {
  constructor(
    private readonly addressRepository: typeof AddressEntity,
    private readonly bankDetailsRepository: typeof BankDetailsEntity,
    private readonly logsService: LogsService,
  ) {}

  async getAddress(): Promise<Address> {
    const address = await this.addressRepository.findAll({
      where: { belongsToCompany: true },
      raw: true,
    });
    return address[0];
  }

  async getBankDetails(): Promise<BankDetails> {
    const bankDetails = await this.bankDetailsRepository.findAll({
      where: { belongsToCompany: true },
      raw: true,
    });
    return bankDetails[0];
  }

  async createAddress(
    addressDto: Address,
    user: Partial<User>,
  ): Promise<{ id: number }> {
    const address: AddressEntity = await AddressEntity.create({
      ...addressDto,
      belongsToCompany: true,
    });

    this.logsService
      .create({
        action: LogActions.CREATE_COMPANY_ADDRESS,
        userId: user.id,
      })
      .catch((err) => {
        console.error(err);
      });

    return { id: address.id };
  }

  async updateAddress(
    id: number,
    addressDto: Partial<Address>,
    user: Partial<User>,
  ): Promise<{ id: number }> {
    const address: AddressEntity = await this.addressRepository.findByPk(id);

    if (!address) {
      throw new NotFoundException();
    }

    await address.update(addressDto);

    await this.logsService
      .create({
        action: LogActions.UPDATE_COMPANY_ADDRESS,
        userId: user.id,
      })
      .catch((err) => {
        console.error(err);
      });

    return { id: address.id };
  }

  async createBankDetails(
    bankDetailsDto: BankDetails,
    user: Partial<User>,
  ): Promise<{ id: number }> {
    const bankDetails: BankDetailsEntity = await BankDetailsEntity.create({
      ...bankDetailsDto,
      belongsToCompany: true,
    });

    await this.logsService
      .create({
        action: LogActions.CREATE_COMPANY_BANK_DETAILS,
        userId: user.id,
      })
      .catch((err) => {
        console.error(err);
      });

    return { id: bankDetails.id };
  }

  async updateBankDetails(
    id: number,
    bankDetailsDto: BankDetails,
    user: Partial<User>,
  ): Promise<{ id: number }> {
    const bankDetails: BankDetailsEntity = await this.bankDetailsRepository.findByPk(
      id,
    );

    if (!bankDetails) {
      throw new NotFoundException();
    }

    await bankDetails.update(bankDetailsDto);

    await this.logsService
      .create({
        action: LogActions.UPDATE_COMPANY_BANK_DETAILS,
        userId: user.id,
      })
      .catch((err) => {
        console.error(err);
      });

    return { id: bankDetails.id };
  }
}
