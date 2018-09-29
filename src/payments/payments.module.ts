import { Module } from '@nestjs/common';
import { DatabaseModule } from 'database/database.module';

import { paymentsProviders } from './payment.providers';

@Module({
  modules: [DatabaseModule],
  controllers: [],
  providers: [...paymentsProviders],
  exports: [...paymentsProviders],
})
export class PaymentsModule {}
