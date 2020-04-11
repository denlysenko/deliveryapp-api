import { Module } from '@nestjs/common';

import { DatabaseModule } from '@deliveryapp/database';
import { MessagesModule } from '@deliveryapp/messages';

import { paymentsProviders } from './payment.providers';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [DatabaseModule, MessagesModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, ...paymentsProviders],
  exports: [PaymentsService, ...paymentsProviders],
})
export class PaymentsModule {}
