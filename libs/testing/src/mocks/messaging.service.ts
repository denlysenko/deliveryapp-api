export const MockMessagingService = {
  sendToTopic: jest.fn().mockResolvedValue({}),
  sendToDevice: jest.fn().mockResolvedValue({}),
  subscribeToTopic: jest.fn().mockResolvedValue({}),
  unsubscribeFromTopic: jest.fn().mockResolvedValue({}),
};
