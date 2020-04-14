import { Global, Module } from '@nestjs/common';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';

import { ConfigService } from '@deliveryapp/config';
import { LogSchema, LOG_MODEL } from '@deliveryapp/repository';

import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: LOG_MODEL, schema: LogSchema }]),
  ],
  controllers: [LogsController],
  providers: [
    {
      provide: LogsService,
      useFactory: (logModel, configService) =>
        new LogsService(logModel, configService),
      inject: [getModelToken(LOG_MODEL), ConfigService],
    },
  ],
  exports: [LogsService],
})
export class LogsModule {}
