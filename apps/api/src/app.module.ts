import { Module } from '@nestjs/common';

import { AuthModule } from '@deliveryapp/auth';
import { ConfigModule } from '@deliveryapp/config';
import { LogsModule } from '@deliveryapp/logs';
import { MessagesModule } from '@deliveryapp/messages';
import { OrdersModule } from '@deliveryapp/orders';
import { PaymentsModule } from '@deliveryapp/payments';
import { RepositoryModule } from '@deliveryapp/repository';
import { SettingsModule } from '@deliveryapp/settings';
import { UsersModule } from '@deliveryapp/users';

@Module({
  imports: [
    ConfigModule,
    RepositoryModule,
    LogsModule,
    AuthModule,
    OrdersModule,
    PaymentsModule,
    SettingsModule,
    UsersModule,
    MessagesModule,
  ],
})
export class AppModule {}
