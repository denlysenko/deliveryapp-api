import { Module } from '@nestjs/common';

import { DatabaseModule } from '@deliveryapp/database';
import { MessagesModule } from '@deliveryapp/messages';
import { OrdersModule } from '@deliveryapp/orders';
import { PaymentsModule } from '@deliveryapp/payments';

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
