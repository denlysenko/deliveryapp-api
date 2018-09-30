import { CompanyAddress, CompanyBankDetails } from './entities';

export const settingsProviders = [
  {
    provide: 'CompanyAddressRepository',
    useValue: CompanyAddress,
  },
  {
    provide: 'CompanyBankDetailsRepository',
    useValue: CompanyBankDetails,
  },
];
