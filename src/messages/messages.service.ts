import { BaseResponse } from '@common/interfaces';

import { ConfigService } from '@config/config.service';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import * as admin from 'firebase-admin';
import * as _ from 'lodash';
import { Model } from 'mongoose';

import { MessageDto } from './dto/message.dto';
import { Message } from './interfaces/message.interface';
import { Session } from './interfaces/session.interface';

// tslint:disable-next-line:no-var-requires
const serviceAccount = require('../../firebase-adminsdk.json');

const TOPIC_NAME = process.env.FIREBASE_TOPIC_NAME;
const MESSAGE_TITLE = 'Delivery App';
const SORT_FIELD = 'createdAt';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel('Session') private readonly sessionModel: Model<Session>,
    @InjectModel('Message') private readonly messageModel: Model<Message>,
    private readonly configService: ConfigService,
  ) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  }

  async createSession(session: Partial<Session>): Promise<Session> {
    const createdSession = new this.sessionModel(session);
    return await createdSession.save();
  }

  async removeSession(socketId: string) {
    await this.sessionModel.deleteOne({ socketId }).exec();
  }

  async subscribeToEmployees(
    socketId: string,
  ): Promise<admin.messaging.MessagingTopicManagementResponse> {
    return await admin.messaging().subscribeToTopic(socketId, TOPIC_NAME);
  }

  async unsubscribeFromEmployees(
    socketId: string,
  ): Promise<admin.messaging.MessagingTopicManagementResponse> {
    return await admin.messaging().unsubscribeFromTopic(socketId, TOPIC_NAME);
  }

  async markAsRead(messageId: string) {
    const message = await this.messageModel.findById(messageId);
    _.assignIn(message, { read: true });
    return await message.save();
  }

  async getByUserId(id: number, query?: any): Promise<BaseResponse<Message>> {
    const conditions = { recipientId: id };
    const offset = (query && Number(query.offset)) || 0;
    const limit =
      (query && Number(query.limit)) ||
      Number(this.configService.get('DEFAULT_LIMIT'));

    const count = await this.messageModel.countDocuments(conditions);

    const rows = await this.messageModel
      .find(conditions)
      .skip(offset)
      .limit(limit)
      .sort({ [SORT_FIELD]: 'desc' })
      .exec();

    return {
      count,
      rows,
    };
  }

  async getForEmployees(query?: any): Promise<BaseResponse<Message>> {
    const conditions = { forEmployee: true };
    const offset = (query && Number(query.offset)) || 0;
    const limit =
      (query && Number(query.limit)) ||
      Number(this.configService.get('DEFAULT_LIMIT'));

    const count = await this.messageModel.countDocuments(conditions);

    const rows = await this.messageModel
      .find(conditions)
      .skip(offset)
      .limit(limit)
      .sort({ [SORT_FIELD]: 'desc' })
      .exec();

    return {
      count,
      rows,
    };
  }

  async saveAndSendToEmployees(
    messageDto: MessageDto,
  ): Promise<admin.messaging.MessagingTopicResponse> {
    const message = await this.createMessage(messageDto);
    const payload = {
      notification: {
        title: MESSAGE_TITLE,
        body: message.text,
      },
      data: {
        _id: message._id.toString(),
        text: message.text,
        createdAt: message.createdAt.toISOString(),
        forEmployee: message.forEmployee.toString(),
        read: message.toString(),
      },
    };

    return await admin.messaging().sendToTopic(TOPIC_NAME, payload);
  }

  async saveAndSendToUser(
    userId: number,
    messageDto: MessageDto,
  ): Promise<Array<admin.messaging.MessagingDevicesResponse>> | null {
    const session = await this.sessionModel.find({ userId }).exec();
    const message = await this.createMessage(messageDto);
    const payload = {
      notification: {
        title: MESSAGE_TITLE,
        body: message.text,
      },
      data: {
        _id: message._id.toString(),
        recipientId: message.recipientId.toString(),
        text: message.text,
        createdAt: message.createdAt.toISOString(),
        forEmployee: message.forEmployee.toString(),
        read: message.toString(),
      },
    };

    if (session && session.length) {
      const promises = session.map(item =>
        admin.messaging().sendToDevice(item.socketId, payload),
      );

      return await Promise.all(promises);
    }

    return null;
  }

  private async createMessage(messageDto: MessageDto): Promise<Message> {
    const createdMessage = new this.messageModel(messageDto);
    return await createdMessage.save();
  }
}
