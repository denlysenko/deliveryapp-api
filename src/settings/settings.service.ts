import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { CompanyAddressDto } from './dto/company-address.dto';
import { CompanyBankDetailsDto } from './dto/company-bank-details.dto';
import { CompanyAddress, CompanyBankDetails } from './entities';

@Injectable()
export class SettingsService {
  constructor(
    @Inject('CompanyAddressRepository')
    private readonly addressRepository: typeof CompanyAddress,
    @Inject('CompanyBankDetailsRepository')
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
    const address = await this.addressRepository.findById(id);

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
    const bankDetails = await this.bankDetailsRepository.findById(id);

    if (!bankDetails) {
      throw new NotFoundException();
    }

    bankDetails.set(bankDetailsDto);

    return await bankDetails.save();
  }
}
