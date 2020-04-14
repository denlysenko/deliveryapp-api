export const createModel = (data: unknown) => {
  return {
    create: jest.fn().mockResolvedValue(data),
    countDocuments: jest.fn(() => Promise.resolve(1)),
    find: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn(() => Promise.resolve([data])),
  };
};
