export const createEntity = (data: unknown) => {
  return {
    findByPk: jest.fn().mockResolvedValue(data),
    findOne: jest.fn().mockResolvedValue(data),
    save: jest.fn().mockResolvedValue({}),
  };
};
