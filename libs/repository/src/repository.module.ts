import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { set } from 'mongoose';
import { Sequelize } from 'sequelize-typescript';

import { SEQUELIZE } from './constants';
import {
  UserEntity,
  AddressEntity,
  BankDetailsEntity,
  OrderEntity,
  PaymentEntity,
} from './entity';

set('debug', process.env.NODE_ENV === 'development');

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
  ],
  providers: [
    {
      provide: SEQUELIZE,
      useFactory: async () => {
        const sequelize = new Sequelize({
          dialect: 'postgres',
          host: process.env.PG_HOST,
          port: parseInt(process.env.PG_PORT, 10),
          username: process.env.PG_USER,
          password: process.env.PG_PASSWORD,
          database: process.env.PG_DB,
          // tslint:disable-next-line:no-console
          logging: process.env.NODE_ENV === 'development' ? console.log : false,
        });
        sequelize.addModels([
          UserEntity,
          AddressEntity,
          BankDetailsEntity,
          OrderEntity,
          PaymentEntity,
        ]);
        await sequelize.sync();
        return sequelize;
      },
    },
  ],
  exports: [SEQUELIZE],
})
export class RepositoryModule {}
