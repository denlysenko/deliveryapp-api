import { Repository } from '@common/enums';

import { Order } from './entities/Order';

export const ordersProviders = [
  {
    provide: Repository.ORDERS,
    useValue: Order,
  },
];
