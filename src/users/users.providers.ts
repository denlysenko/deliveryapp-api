import { Repository } from 'common/enums/repositories.enum';

import { User } from './entities/User';

export const usersProviders = [
  {
    provide: Repository.USERS,
    useValue: User,
  },
];
