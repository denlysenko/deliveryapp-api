import { Repository } from '@common/enums';

import { User } from './entities/User';

export const usersProviders = [
  {
    provide: Repository.USERS,
    useValue: User,
  },
];
