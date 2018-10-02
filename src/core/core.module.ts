import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from 'config/config.module';
import { DatabaseModule } from 'database/database.module';
import { LogsModule } from 'logs/logs.module';
import { set } from 'mongoose';

set('debug', process.env.NODE_ENV === 'development');

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URL),
    DatabaseModule,
    ConfigModule,
    LogsModule,
  ],
})
export class CoreModule {}
