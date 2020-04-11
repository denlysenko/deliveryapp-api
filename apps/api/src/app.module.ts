import { Module } from '@nestjs/common';

import { AuthModule } from '@deliveryapp/auth';
import { CoreModule } from '@deliveryapp/core';
import { MessagesModule } from '@deliveryapp/messages';
import { OrdersModule } from '@deliveryapp/orders';
import { PaymentsModule } from '@deliveryapp/payments';
import { SettingsModule } from '@deliveryapp/settings';
import { UsersModule } from '@deliveryapp/users';

@Module({
  imports: [
    CoreModule,
    AuthModule,
    UsersModule,
    PaymentsModule,
    OrdersModule,
    SettingsModule,
    MessagesModule,
  ],
})
export class AppModule {}
