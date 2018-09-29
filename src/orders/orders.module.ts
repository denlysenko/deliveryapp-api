import { Module } from '@nestjs/common';
import { DatabaseModule } from 'database/database.module';

import { ordersProviders } from './orders.providers';
import { OrderService } from './orders.service';

@Module({
  modules: [DatabaseModule],
  controllers: [],
  providers: [OrderService, ...ordersProviders],
  exports: [OrderService, ...ordersProviders],
})
export class OrdersModule {}
