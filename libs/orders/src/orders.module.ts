import { Module } from '@nestjs/common';

import { ConfigService } from '@deliveryapp/config';
import { LogsService } from '@deliveryapp/logs';
import { MessagesModule, MessagesService } from '@deliveryapp/messages';
import { OrderEntity, ORDERS_REPOSITORY } from '@deliveryapp/repository';

import { OrdersController } from './orders.controller';
import { OrderService } from './orders.service';

@Module({
  imports: [MessagesModule],
  controllers: [OrdersController],
  providers: [
    {
      provide: ORDERS_REPOSITORY,
      useValue: OrderEntity,
    },
    {
      provide: OrderService,
      useFactory: (
        ordersRepository,
        configService: ConfigService,
        messagesService: MessagesService,
        logsService: LogsService,
      ) =>
        new OrderService(
          ordersRepository,
          configService,
          messagesService,
          logsService,
        ),
      inject: [ORDERS_REPOSITORY, ConfigService, MessagesService, LogsService],
    },
  ],
})
export class OrdersModule {}
