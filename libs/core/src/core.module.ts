import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ConfigModule } from '@deliveryapp/config';
import { DatabaseModule } from '@deliveryapp/database';
import { LogsModule } from '@deliveryapp/logs';

import { set } from 'mongoose';

set('debug', process.env.NODE_ENV === 'development');

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
    DatabaseModule,
    ConfigModule,
    LogsModule,
  ],
})
export class CoreModule {}
