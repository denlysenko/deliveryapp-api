import { Module } from '@nestjs/common';

import { DatabaseModule } from '@deliveryapp/database';
import { MessagesModule } from '@deliveryapp/messages';

import { OrdersController } from './orders.controller';
import { ordersProviders } from './orders.providers';
import { OrderService } from './orders.service';

@Module({
  imports: [DatabaseModule, MessagesModule],
  controllers: [OrdersController],
  providers: [OrderService, ...ordersProviders],
  exports: [OrderService, ...ordersProviders],
})
export class OrdersModule {}
