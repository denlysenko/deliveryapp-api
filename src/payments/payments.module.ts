import { Module } from '@nestjs/common';
import { DatabaseModule } from 'database/database.module';
import { LogsModule } from 'logs/logs.module';
import { MessagesModule } from 'messages/messages.module';

import { paymentsProviders } from './payment.providers';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [DatabaseModule, LogsModule, MessagesModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, ...paymentsProviders],
  exports: [PaymentsService, ...paymentsProviders],
})
export class PaymentsModule {}
