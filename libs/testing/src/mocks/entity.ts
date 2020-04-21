export const createEntity = (data: unknown) => {
  return {
    findByPk: jest.fn().mockResolvedValue(data),
    findOne: jest.fn().mockResolvedValue(data),
    findAndCountAll: jest.fn().mockResolvedValue({ count: 1, rows: [data] }),
    findAll: jest.fn().mockResolvedValue([data]),
    scope: jest.fn().mockReturnThis(),
    save: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    sequelize: {
      transaction: jest.fn((cb) => cb()),
    },
    $set: jest.fn().mockResolvedValue({}),
    set: jest.fn(),
  };
};
