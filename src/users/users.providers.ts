import { User } from './entities/user.entity';

export const usersProviders = [
  {
    provide: 'UsersRepository',
    useValue: User,
  },
];
