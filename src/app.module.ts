import { Module } from '@nestjs/common';
import { AuthModule } from 'auth/auth.module';
import { ConfigModule } from 'config/config.module';
import { CoreModule } from 'core/core.module';
import { LogsModule } from 'logs/logs.module';
import { MessagesModule } from 'messages/messages.module';
import { OrdersModule } from 'orders/orders.module';
import { PaymentsModule } from 'payments/payments.module';
import { SettingsModule } from 'settings/settings.module';
import { UsersModule } from 'users/users.module';

@Module({
  imports: [
    CoreModule,
    ConfigModule,
    AuthModule,
    UsersModule,
    PaymentsModule,
    OrdersModule,
    SettingsModule,
    MessagesModule,
    LogsModule,
  ],
})
export class AppModule {}
