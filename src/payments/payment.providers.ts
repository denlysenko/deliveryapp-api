import { Repository } from '@common/enums';

import { Payment } from './entities/Payment';

export const paymentsProviders = [
  {
    provide: Repository.PAYMENTS,
    useValue: Payment,
  },
];
