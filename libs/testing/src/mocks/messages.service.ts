import { session } from '../test-data/session';

export const MockMessagesService = {
  saveMessage: jest.fn().mockResolvedValue({}),
  findSessions: jest.fn().mockResolvedValue([session]),
};
