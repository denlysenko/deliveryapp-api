import { Module } from '@nestjs/common';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';

import { ConfigService } from '@deliveryapp/config';
import {
  MessageSchema,
  MESSAGE_MODEL,
  SessionSchema,
  SESSION_MODEL,
} from '@deliveryapp/repository';

import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { MessagingService } from './messaging.service';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MESSAGE_MODEL, schema: MessageSchema },
      { name: SESSION_MODEL, schema: SessionSchema },
    ]),
  ],
  controllers: [MessagesController],
  providers: [
    NotificationService,
    MessagingService,
    {
      provide: MessagesService,
      useFactory: (
        sessionModel,
        messageModel,
        configService,
        messagingService,
      ) =>
        new MessagesService(
          sessionModel,
          messageModel,
          configService,
          messagingService,
        ),
      inject: [
        getModelToken(SESSION_MODEL),
        getModelToken(MESSAGE_MODEL),
        ConfigService,
        MessagingService,
      ],
    },
  ],
  exports: [NotificationService],
})
export class MessagesModule {}
