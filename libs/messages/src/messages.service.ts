import { NotFoundException } from '@nestjs/common';

import { MessagesErrors, Role } from '@deliveryapp/common';
import { ConfigService } from '@deliveryapp/config';
import {
  BaseQuery,
  BaseResponse,
  ICurrentUser,
  Message,
  Session,
} from '@deliveryapp/core';

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

  async subscribe(socketId: string, currentUser: ICurrentUser): Promise<void> {
    await this.sessionModel.create({ socketId, userId: currentUser.id });

    if (currentUser.role !== Role.CLIENT) {
      await this.messagingService.subscribeToTopic(socketId);
    }
  }

  async unsubscribe(
    socketId: string,
    currentUser: ICurrentUser,
  ): Promise<void> {
    await this.sessionModel.deleteOne({ socketId }).exec();

    if (currentUser.role !== Role.CLIENT) {
      await this.messagingService.unsubscribeFromTopic(socketId);
    }
  }

  async markAsRead(messageId: string): Promise<void> {
    const message = await this.messageModel.findById(messageId).exec();

    if (isNil(message)) {
      throw new NotFoundException(MessagesErrors.MESSAGE_NOT_FOUND_ERR);
    }

    assignIn(message, { read: true });

    await message.save();
  }

  async findMessages(
    query: BaseQuery,
    currentUser: ICurrentUser,
  ): Promise<BaseResponse<Message>> {
    const where: FilterQuery<Message> = {};

    if (currentUser.role === Role.CLIENT) {
      where.recipientId = currentUser.id;
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

  async saveMessage(message: Message): Promise<Message> {
    const createdMessage = await this.messageModel.create(message);
    return createdMessage.toJSON() as Message;
  }

  findSessions(userId: number): Promise<Session[]> {
    return this.sessionModel.find({ userId }).exec();
  }
}
