import { Module } from '@nestjs/common';
import { AuthModule } from 'auth/auth.module';
import { ConfigModule } from 'config/config.module';
import { OrdersModule } from 'orders/orders.module';
import { PaymentsModule } from 'payments/payments.module';
import { SettingsModule } from 'settings/settings.module';
import { UsersModule } from 'users/users.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    UsersModule,
    PaymentsModule,
    OrdersModule,
    SettingsModule,
  ],
})
export class AppModule {}
