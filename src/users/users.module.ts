import { Module } from '@nestjs/common';
import { DatabaseModule } from 'database/database.module';
import { LogsModule } from 'logs/logs.module';
import { OrdersModule } from 'orders/orders.module';
import { PaymentsModule } from 'payments/payments.module';

import { UserOrdersController } from './controllers/user-orders.controller';
import { UserPaymentsController } from './controllers/user-payments.controller';
import { UserSelfController } from './controllers/user-self.controller';
import { UsersController } from './controllers/users.controller';
import { usersProviders } from './users.providers';
import { UsersService } from './users.service';

@Module({
  imports: [DatabaseModule, OrdersModule, PaymentsModule, LogsModule],
  controllers: [
    UsersController,
    UserSelfController,
    UserOrdersController,
    UserPaymentsController,
  ],
  providers: [...usersProviders, UsersService],
  exports: [...usersProviders, UsersService],
})
export class UsersModule {}
