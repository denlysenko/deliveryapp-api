import { Repository } from 'common/enums/repositories.enum';

import { Payment } from './entities/Payment';

export const paymentsProviders = [
  {
    provide: Repository.PAYMENTS,
    useValue: Payment,
  },
];
