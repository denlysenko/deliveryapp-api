export const createEntity = (data: unknown) => {
  return {
    findByPk: jest.fn().mockResolvedValue(data),
    findOne: jest.fn().mockResolvedValue(data),
    findAndCountAll: jest.fn().mockResolvedValue({ count: 1, rows: [data] }),
    scope: jest.fn().mockReturnThis(),
    save: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
  };
};
