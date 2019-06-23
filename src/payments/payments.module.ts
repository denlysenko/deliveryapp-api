import { DatabaseModule } from '@database/database.module';
import { MessagesModule } from '@messages/messages.module';

import { Module } from '@nestjs/common';

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
