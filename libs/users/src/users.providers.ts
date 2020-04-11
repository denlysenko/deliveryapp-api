import { Repository } from '@deliveryapp/common';

import { User } from './entities/User';

export const usersProviders = [
  {
    provide: Repository.USERS,
    useValue: User,
  },
];
