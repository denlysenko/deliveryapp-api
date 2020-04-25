import { Module } from '@nestjs/common';

import { ConfigService } from '@deliveryapp/config';
import { LogsService } from '@deliveryapp/logs';
import { MessagesModule, NotificationService } from '@deliveryapp/messages';
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
        notificationService: NotificationService,
        logsService: LogsService,
      ) =>
        new OrderService(
          ordersRepository,
          configService,
          notificationService,
          logsService,
        ),
      inject: [
        ORDERS_REPOSITORY,
        ConfigService,
        NotificationService,
        LogsService,
      ],
    },
  ],
})
export class OrdersModule {}
