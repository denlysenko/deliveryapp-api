import { NotFoundException } from '@nestjs/common';

import { MessagesErrors, Role } from '@deliveryapp/common';
import { ConfigService } from '@deliveryapp/config';
import { BaseQuery, ICurrentUser, Message, Session } from '@deliveryapp/core';

import { assignIn, isNil } from 'lodash';
import { Document, FilterQuery, Model } from 'mongoose';
import { MessagingService } from './messaging.service';

interface MessageModel extends Message, Document {
  _id: any;
}
interface SessionModel extends Session, Document {}

const SORT_FIELD = 'createdAt';

export class MessagesService {
  constructor(
    private readonly sessionModel: Model<SessionModel>,
    private readonly messageModel: Model<MessageModel>,
    private readonly configService: ConfigService,
    private readonly messagingService: MessagingService,
  ) {}

  async subscribe(session: Session, user: ICurrentUser): Promise<void> {
    const createdSession = new this.sessionModel(session);

    await createdSession.save();

    if (user.role !== Role.CLIENT) {
      await this.messagingService.subscribeToTopic(session.socketId);
    }
  }

  async unsubscribe(socketId: string, user: ICurrentUser): Promise<void> {
    await this.sessionModel.deleteOne({ socketId }).exec();

    if (user.role !== Role.CLIENT) {
      await this.messagingService.unsubscribeFromTopic(socketId);
    }
  }

  async markAsRead(messageId: string): Promise<void> {
    const message = await this.messageModel.findById(messageId);

    if (isNil(message)) {
      throw new NotFoundException(MessagesErrors.MESSAGE_NOT_FOUND_ERR);
    }

    assignIn(message, { read: true });

    await message.save();
  }

  async getMessages(query: BaseQuery, user: ICurrentUser) {
    const where: FilterQuery<Message> = {};

    if (user.role === Role.CLIENT) {
      where.recipientId = user.id;
    } else {
      where.forEmployee = true;
    }

    const offset = query.offset ?? 0;
    const limit =
      query.limit ?? parseInt(this.configService.get('DEFAULT_LIMIT'), 10);

    const cursor = this.messageModel
      .find(where)
      .skip(offset)
      .limit(limit)
      .sort({ [SORT_FIELD]: 'desc' });

    const [count, rows] = await Promise.all([
      this.messageModel.countDocuments(where),
      cursor.exec(),
    ]);

    return {
      count,
      rows,
    };
  }

  saveMessage(messageDto: Message) {
    const createdMessage = new this.messageModel(messageDto);
    return createdMessage.save();
  }

  getSessions(userId: number): Promise<Session[]> {
    return this.sessionModel.find({ userId }).exec();
  }
}
