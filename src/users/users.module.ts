import { DatabaseModule } from '@database/database.module';

import { MessagesModule } from '@messages/messages.module';

import { Module } from '@nestjs/common';

import { OrdersModule } from '@orders/orders.module';

import { PaymentsModule } from '@payments/payments.module';

import { UserMessagesController } from './controllers/user-messages.controller';
import { UserOrdersController } from './controllers/user-orders.controller';
import { UserPaymentsController } from './controllers/user-payments.controller';
import { UserSelfController } from './controllers/user-self.controller';
import { UsersController } from './controllers/users.controller';
import { usersProviders } from './users.providers';
import { UsersService } from './users.service';

@Module({
  imports: [DatabaseModule, OrdersModule, PaymentsModule, MessagesModule],
  controllers: [
    UserSelfController,
    UserOrdersController,
    UserPaymentsController,
    UserMessagesController,
    UsersController,
  ],
  providers: [...usersProviders, UsersService],
  exports: [...usersProviders, UsersService],
})
export class UsersModule {}
