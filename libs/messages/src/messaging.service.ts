import { Message } from '@deliveryapp/core';

import * as admin from 'firebase-admin';
import * as fs from 'fs';

const TOPIC_NAME = process.env.FIREBASE_TOPIC_NAME!;
const MESSAGE_TITLE = 'Delivery App';

export class MessagingService {
  constructor() {
    const serviceAccount = JSON.parse(
      fs.readFileSync(`${__dirname}/firebase-adminsdk.json`, 'utf-8'),
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  }

  subscribeToTopic(
    socketId: string,
  ): Promise<admin.messaging.MessagingTopicManagementResponse> {
    return admin.messaging().subscribeToTopic(socketId, TOPIC_NAME);
  }

  unsubscribeFromTopic(
    socketId: string,
  ): Promise<admin.messaging.MessagingTopicManagementResponse> {
    return admin.messaging().unsubscribeFromTopic(socketId, TOPIC_NAME);
  }

  sendToTopic(
    message: Message,
  ): Promise<admin.messaging.MessagingTopicResponse> {
    const payload = {
      notification: {
        title: MESSAGE_TITLE,
        body: message.text,
      },
      data: {
        _id: message._id.toString(),
        text: message.text,
        createdAt: message.createdAt!.toISOString(),
        forEmployee: message.forEmployee!.toString(),
        read: message.read!.toString(),
      },
    };

    return admin.messaging().sendToTopic(TOPIC_NAME, payload);
  }

  sendToDevice(
    socketId: string,
    message: Message,
  ): Promise<admin.messaging.MessagingDevicesResponse> {
    const payload = {
      notification: {
        title: MESSAGE_TITLE,
        body: message.text,
      },
      data: {
        _id: message._id.toString(),
        recipientId: message.recipientId!.toString(),
        text: message.text,
        createdAt: message.createdAt!.toISOString(),
        forEmployee: message.forEmployee!.toString(),
        read: message.read!.toString(),
      },
    };

    return admin.messaging().sendToDevice(socketId, payload);
  }
}
