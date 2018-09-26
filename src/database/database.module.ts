import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { set } from 'mongoose';

import { databaseProviders } from './database.providers';

set('debug', process.env.NODE_ENV === 'development');

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGO_URL)],
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
