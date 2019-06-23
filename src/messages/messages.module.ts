import { AuthModule } from '@auth/auth.module';

import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MessagesGateway } from './messages.gateway';
import { MessagesService } from './messages.service';
import { MessageSchema } from './schemas/message.schema';
import { SessionSchema } from './schemas/session.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Message', schema: MessageSchema },
      { name: 'Session', schema: SessionSchema },
    ]),
    forwardRef(() => AuthModule),
  ],
  providers: [MessagesGateway, MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
