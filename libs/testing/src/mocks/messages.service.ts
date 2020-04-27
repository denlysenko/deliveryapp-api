import { session } from '../test-data/session';

export const MockMessagesService = {
  saveMessage: jest.fn().mockResolvedValue({}),
  getSessions: jest.fn().mockResolvedValue([session]),
};
