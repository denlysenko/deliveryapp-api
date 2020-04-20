import { order } from './order';
import { user } from './user';

export const payment = {
  id: 1,
  method: 2,
  status: false,
  total: 17,
  paymentAmount: null,
  paymentDate: null,
  dueDate: '2020-04-29T14:11:39.904Z',
  notes: null,
  description: null,
  createdAt: '2020-04-19T16:49:39.800Z',
  updatedAt: '2020-04-19T16:49:39.800Z',
  orders: [order],
  client: user,
};
