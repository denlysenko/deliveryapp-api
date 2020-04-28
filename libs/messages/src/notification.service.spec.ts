import { Test, TestingModule } from '@nestjs/testing';

import {
  MockMessagesService,
  MockMessagingService,
  message,
  session,
} from '@deliveryapp/testing';

import { MessagesService } from './messages.service';
import { MessagingService } from './messaging.service';
import { NotificationService } from './notification.service';

const recipientId = 1;

describe('NotificationService', () => {
  let service: NotificationService;
  let messagesService: MessagesService;
  let messagingService: MessagingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: MessagingService,
          useValue: MockMessagingService,
        },
        {
          provide: MessagesService,
          useValue: MockMessagesService,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    messagesService = module.get<MessagesService>(MessagesService);
    messagingService = module.get<MessagingService>(MessagingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendNotification', () => {
    it('should save message', async () => {
      await service.sendNotification(message);
      expect(messagesService.saveMessage).toBeCalledWith(message);
    });

    describe('forEmployee is true', () => {
      let saveMessageSpy: jest.SpyInstance;

      beforeEach(() => {
        saveMessageSpy = jest
          .spyOn(messagesService, 'saveMessage')
          .mockResolvedValue({
            ...message,
            forEmployee: true,
          });
      });

      afterEach(() => {
        saveMessageSpy.mockRestore();
      });

      it('should send to topic if forEmployee is true', async () => {
        await service.sendNotification(message);
        expect(messagingService.sendToTopic).toBeCalledWith(message);
      });
    });

    describe('forEmployee is false', () => {
      let saveMessageSpy: jest.SpyInstance;

      beforeEach(() => {
        saveMessageSpy = jest
          .spyOn(messagesService, 'saveMessage')
          .mockResolvedValue({
            ...message,
            forEmployee: false,
            recipientId,
          });
      });

      afterEach(() => {
        saveMessageSpy.mockRestore();
      });

      it('should get sessions', async () => {
        await service.sendNotification(message);
        expect(messagesService.findSessions).toBeCalledWith(recipientId);
      });

      it('should send to device if there are sessions', async () => {
        await service.sendNotification(message);
        expect(messagingService.sendToDevice).toBeCalledWith(session.socketId, {
          ...message,
          forEmployee: false,
          recipientId,
        });
      });

      it('should not send to device if there are no sessions', async () => {
        jest.spyOn(messagesService, 'findSessions').mockResolvedValueOnce([]);
        await service.sendNotification(message);
        expect(messagingService.sendToDevice).toBeCalledTimes(0);
      });
    });
  });
});
