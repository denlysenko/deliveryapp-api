import { Repository } from '@deliveryapp/common';

import { Payment } from './entities/Payment';

export const paymentsProviders = [
  {
    provide: Repository.PAYMENTS,
    useValue: Payment,
  },
];
