import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { set } from 'mongoose';

set('debug', process.env.NODE_ENV === 'development');

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGO_URL)],
})
export class CoreModule {}
