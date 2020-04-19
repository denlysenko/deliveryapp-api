import { Module } from '@nestjs/common';

import { ConfigService } from '@deliveryapp/config';
import { LogsService } from '@deliveryapp/logs';
import { MessagesModule, MessagesService } from '@deliveryapp/messages';
import { PaymentEntity, PAYMENTS_REPOSITORY } from '@deliveryapp/repository';

import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [MessagesModule],
  controllers: [PaymentsController],
  providers: [
    {
      provide: PAYMENTS_REPOSITORY,
      useValue: PaymentEntity,
    },
    {
      provide: PaymentsService,
      useFactory: (
        paymentsRepository,
        configService: ConfigService,
        messagesService: MessagesService,
        logsService: LogsService,
      ) =>
        new PaymentsService(
          paymentsRepository,
          configService,
          messagesService,
          logsService,
        ),
      inject: [
        PAYMENTS_REPOSITORY,
        ConfigService,
        MessagesService,
        LogsService,
      ],
    },
  ],
})
export class PaymentsModule {}
