import { Module } from '@nestjs/common';
import { DatabaseModule } from 'database/database.module';
import { LogsModule } from 'logs/logs.module';
import { MessagesModule } from 'messages/messages.module';

import { OrdersController } from './orders.controller';
import { ordersProviders } from './orders.providers';
import { OrderService } from './orders.service';

@Module({
  imports: [DatabaseModule, LogsModule, MessagesModule],
  controllers: [OrdersController],
  providers: [OrderService, ...ordersProviders],
  exports: [OrderService, ...ordersProviders],
})
export class OrdersModule {}
