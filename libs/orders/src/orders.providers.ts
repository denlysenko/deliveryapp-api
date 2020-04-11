import { Repository } from '@deliveryapp/common';

import { Order } from './entities/Order';

export const ordersProviders = [
  {
    provide: Repository.ORDERS,
    useValue: Order,
  },
];
