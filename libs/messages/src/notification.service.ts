import { Injectable } from '@nestjs/common';

import { Message } from '@deliveryapp/core';

import { MessagesService } from './messages.service';
import { MessagingService } from './messaging.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly messagingService: MessagingService,
  ) {}

  async sendNotification(message: Message) {
    const savedMessage = await this.messagesService.saveMessage(message);

    if (savedMessage.forEmployee) {
      return this.sendToEmployees(savedMessage);
    }

    return this.sendToUser(savedMessage, savedMessage.recipientId);
  }

  private async sendToUser(message: Message, userId: number) {
    const sessions = await this.messagesService.getSessions(userId);

    if (sessions && sessions.length) {
      const promises = sessions.map((item) =>
        this.messagingService.sendToDevice(item.socketId, message),
      );

      return Promise.all(promises);
    }
  }

  private sendToEmployees(message: Message) {
    return this.messagingService.sendToTopic(message);
  }
}
