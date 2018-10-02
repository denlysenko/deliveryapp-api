import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { LogSchema } from './schemas/log.schema';

@Global()
@Module({
  imports: [MongooseModule.forFeature([{ name: 'Log', schema: LogSchema }])],
  controllers: [LogsController],
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule {}
