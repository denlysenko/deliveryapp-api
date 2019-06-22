import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { Repository } from 'common/enums/repositories.enum';

import { CompanyAddressDto } from './dto/company-address.dto';
import { CompanyBankDetailsDto } from './dto/company-bank-details.dto';
import { CompanyAddress } from './entities/CompanyAddress';
import { CompanyBankDetails } from './entities/CompanyBankDetails';

@Injectable()
export class SettingsService {
  constructor(
    @Inject(Repository.COMPANY_ADDRESS)
    private readonly addressRepository: typeof CompanyAddress,
    @Inject(Repository.COMPANY_BANK_DETAILS)
    private readonly bankDetailsRepository: typeof CompanyBankDetails,
  ) {}

  async getAddress(): Promise<CompanyAddress> {
    const address = await this.addressRepository.findAll({ raw: true });
    return address[0];
  }

  async getBankDetails(): Promise<CompanyBankDetails> {
    const bankDetails = await this.bankDetailsRepository.findAll({ raw: true });
    return bankDetails[0];
  }

  async createAddress(addressDto: CompanyAddressDto): Promise<CompanyAddress> {
    return await CompanyAddress.create(addressDto);
  }

  async updateAddress(
    id: number,
    addressDto: CompanyAddressDto,
  ): Promise<CompanyAddress> {
    const address = await this.addressRepository.findByPk(id);

    if (!address) {
      throw new NotFoundException();
    }

    address.set(addressDto);

    return await address.save();
  }

  async createBankDetails(
    bankDetailsDto: CompanyBankDetailsDto,
  ): Promise<CompanyBankDetails> {
    return await CompanyBankDetails.create(bankDetailsDto);
  }

  async updateBankDetails(
    id: number,
    bankDetailsDto: CompanyBankDetailsDto,
  ): Promise<CompanyBankDetails> {
    const bankDetails = await this.bankDetailsRepository.findByPk(id);

    if (!bankDetails) {
      throw new NotFoundException();
    }

    bankDetails.set(bankDetailsDto);

    return await bankDetails.save();
  }
}
