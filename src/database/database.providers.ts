import { Sequelize } from 'sequelize-typescript';

export const databaseProviders = [
  {
    provide: 'Sequelize',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'postgres',
        host: process.env.PG_HOST,
        port: 5432,
        username: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
        database: process.env.PG_DB,
        operatorsAliases: false,
        logging: process.env.NODE_ENV === 'development',
      });
      sequelize.addModels([`${__dirname}/../**/entities/*.{ts,js}`]);
      await sequelize.sync();
      return sequelize;
    },
  },
];
