import { Module } from '@nestjs/common';
import { DatabaseModule } from 'database/database.module';
import { OrdersModule } from 'orders/orders.module';

import { UserOrdersController } from './user-orders.controller';
import { UserSelfController } from './user-self.controller';
import { UsersController } from './users.controller';
import { usersProviders } from './users.providers';
import { UsersService } from './users.service';

@Module({
  imports: [DatabaseModule, OrdersModule],
  controllers: [UsersController, UserSelfController, UserOrdersController],
  providers: [...usersProviders, UsersService],
  exports: [...usersProviders, UsersService],
})
export class UsersModule {}
