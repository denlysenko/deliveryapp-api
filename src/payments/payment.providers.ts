import { Payment } from './entities';

export const paymentsProviders = [
  {
    provide: 'PaymentsRepository',
    useValue: Payment,
  },
];
