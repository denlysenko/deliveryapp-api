import { Module } from '@nestjs/common';
import { DatabaseModule } from 'database/database.module';

import { usersProviders } from './users.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [...usersProviders],
  exports: [...usersProviders],
})
export class UsersModule {}
