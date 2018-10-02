import { Repository } from 'common/enums/repositories.enum';

import { Order } from './entities/Order';

export const ordersProviders = [
  {
    provide: Repository.ORDERS,
    useValue: Order,
  },
];
