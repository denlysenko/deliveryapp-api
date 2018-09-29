import { Order } from './entities';

export const ordersProviders = [
  {
    provide: 'OrdersRepository',
    useValue: Order,
  },
];
