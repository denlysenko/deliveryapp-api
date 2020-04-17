import { Module } from '@nestjs/common';

import { AuthModule } from '@deliveryapp/auth';
import { MessagesModule } from '@deliveryapp/messages';
import { OrdersModule } from '@deliveryapp/orders';
import { PaymentsModule } from '@deliveryapp/payments';
import { RepositoryModule } from '@deliveryapp/repository';
import { SettingsModule } from '@deliveryapp/settings';
import { UsersModule } from '@deliveryapp/users';
import { LogsModule } from '@deliveryapp/logs';
import { ConfigModule } from '@deliveryapp/config';

@Module({
  imports: [
    ConfigModule,
    RepositoryModule,
    LogsModule,
    AuthModule,
    OrdersModule,
    // UsersModule,
    // PaymentsModule,
    // SettingsModule,
    // MessagesModule,
  ],
})
export class AppModule {}
