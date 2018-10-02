import { Repository } from 'common/enums/repositories.enum';

import { CompanyAddress } from './entities/CompanyAddress';
import { CompanyBankDetails } from './entities/CompanyBankDetails';

export const settingsProviders = [
  {
    provide: Repository.COMPANY_ADDRESS,
    useValue: CompanyAddress,
  },
  {
    provide: Repository.COMPANY_BANK_DETAILS,
    useValue: CompanyBankDetails,
  },
];
