import { HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { Role } from '@deliveryapp/common';
import { ConfigService } from '@deliveryapp/config';
import { MESSAGE_MODEL, SESSION_MODEL } from '@deliveryapp/repository';
import {
  createModel,
  message,
  MockConfigService,
  MockMessagingService,
  session,
} from '@deliveryapp/testing';

import { MessagesService } from './messages.service';
import { MessagingService } from './messaging.service';

const client = { id: 1, role: Role.CLIENT };
const admin = { id: 2, role: Role.ADMIN };

const messagesQuery = {
  offset: 10,
  limit: 5,
};

const messageModel = createModel(message);
const sessionModel = createModel(session);

describe('MessagesService', () => {
  let service: MessagesService;
  let messagingService: MessagingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: MessagesService,
          useFactory: (
            sessionModel,
            messageModel,
            configService: ConfigService,
            messagingService: MessagingService,
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
        {
          provide: getModelToken(SESSION_MODEL),
          useValue: sessionModel,
        },
        {
          provide: getModelToken(MESSAGE_MODEL),
          useValue: messageModel,
        },
        {
          provide: ConfigService,
          useValue: MockConfigService,
        },
        {
          provide: MessagingService,
          useValue: MockMessagingService,
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    messagingService = module.get<MessagingService>(MessagingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('subscribe', () => {
    it('should create session', async () => {
      await service.subscribe(session, client);
      expect(sessionModel.create).toBeCalledWith(session);
    });

    it('should subscribe to topic if not client', async () => {
      await service.subscribe(session, admin);
      expect(messagingService.subscribeToTopic).toBeCalledWith(
        session.socketId,
      );
    });
  });

  describe('unsubscribe', () => {
    it('should create session', async () => {
      await service.unsubscribe(session.socketId, client);
      expect(sessionModel.deleteOne).toBeCalledWith({
        socketId: session.socketId,
      });
    });

    it('should unsubscribe from topic if not client', async () => {
      await service.unsubscribe(session.socketId, admin);
      expect(messagingService.unsubscribeFromTopic).toBeCalledWith(
        session.socketId,
      );
    });
  });

  describe('markAsRead', () => {
    it('should find message', async () => {
      jest
        .spyOn(messageModel, 'exec')
        .mockResolvedValueOnce(messageModel as any);

      await service.markAsRead(message._id);
      expect(messageModel.findById).toBeCalledWith(message._id);
    });

    it('should throw 404', async () => {
      jest.spyOn(messageModel, 'exec').mockResolvedValueOnce(null as any);

      try {
        await service.markAsRead(message._id);
      } catch (err) {
        expect(err.status).toEqual(HttpStatus.NOT_FOUND);
      }
    });

    it('should update and save', async () => {
      jest
        .spyOn(messageModel, 'exec')
        .mockResolvedValueOnce(messageModel as any);

      await service.markAsRead(message._id);
      expect(messageModel.save).toBeCalledTimes(1);
    });
  });

  describe('getMessages', () => {
    it('should build cursor for client', async () => {
      await service.getMessages(messagesQuery, client);
      expect(messageModel.find).toBeCalledWith({ recipientId: client.id });
      expect(messageModel.skip).toBeCalledWith(messagesQuery.offset);
      expect(messageModel.limit).toBeCalledWith(messagesQuery.limit);
    });

    it('should build cursor for admin', async () => {
      await service.getMessages(messagesQuery, admin);
      expect(messageModel.find).toBeCalledWith({ forEmployee: true });
      expect(messageModel.skip).toBeCalledWith(messagesQuery.offset);
      expect(messageModel.limit).toBeCalledWith(messagesQuery.limit);
    });

    it('should return messages', async () => {
      expect(await service.getMessages(messagesQuery, admin)).toEqual({
        count: 1,
        rows: [message],
      });
    });
  });

  describe('saveMessage', () => {
    it('should create message', async () => {
      jest
        .spyOn(messageModel, 'create')
        .mockResolvedValueOnce({ ...message, toJSON: jest.fn(() => message) });

      await service.saveMessage(message);
      expect(messageModel.create).toBeCalledWith(message);
    });
  });

  describe('getSessions', () => {
    it('should find sessions', async () => {
      await service.getSessions(client.id);
      expect(sessionModel.find).toBeCalledWith({ userId: client.id });
    });
  });
});
