import { Module } from '@nestjs/common';
import { AuthModule } from 'auth/auth.module';
import { CoreModule } from 'core/core.module';
import { MessagesModule } from 'messages/messages.module';
import { OrdersModule } from 'orders/orders.module';
import { PaymentsModule } from 'payments/payments.module';
import { SettingsModule } from 'settings/settings.module';
import { UsersModule } from 'users/users.module';

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
