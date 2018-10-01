import { Component } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as _ from 'lodash';
import { Model } from 'mongoose';

import { MessageDto } from './dto/message.dto';
import { SessionDto } from './dto/session.dto';
import { Message } from './interfaces/message.interface';
import { Session } from './interfaces/session.interface';
import { EMPLOYEES_ROOM, MARK_AS_READ_SUCCESS, MESSAGE } from './messages.gateway';

@Component()
export class MessagesService {
  server: SocketIO.Server;

  constructor(
    @InjectModel('Session') private readonly sessionModel: Model<Session>,
    @InjectModel('Message') private readonly messageModel: Model<Message>,
  ) {}

  setIOServer(server: SocketIO.Server) {
    this.server = server;
  }

  async createSession(sessionDto: SessionDto): Promise<Session> {
    const createdSession = new this.sessionModel(sessionDto);
    return await createdSession.save();
  }

  async removeSession(socketId: string) {
    await this.sessionModel.remove({ socketId }).exec();
  }

  async markAsRead(messageId: string, socketId: string) {
    const message = await this.messageModel.findById(messageId);
    _.assignIn(message, { read: true });
    const savedMessage = await message.save();
    this.server
      .to(savedMessage.forEmployee ? EMPLOYEES_ROOM : socketId)
      .emit(MARK_AS_READ_SUCCESS, { data: message._id });
  }

  async getByUserId(id: number): Promise<Message[]> {
    return await this.messageModel.find({ recipientId: id }).exec();
  }

  async getForEmployees(): Promise<Message[]> {
    return await this.messageModel.find({ forEmployee: true }).exec();
  }

  async saveAndSendToEmployees(messageDto: MessageDto) {
    const message = await this.createMessage(messageDto);
    this.server.in(EMPLOYEES_ROOM).emit(MESSAGE, { data: message });
  }

  async saveAndSendToUser(userId: number, messageDto: MessageDto) {
    const session = await this.sessionModel.find({ userId }).exec();
    const message = await this.createMessage(messageDto);

    if (session && session.length) {
      session.forEach(item => {
        this.server.to(item.socketId).emit(MESSAGE, { data: message });
      });
    }
  }

  private async createMessage(messageDto: MessageDto): Promise<Message> {
    const createdMessage = new this.messageModel(messageDto);
    return await createdMessage.save();
  }
}
