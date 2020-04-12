import { Module } from '@nestjs/common';

import { ConfigModule } from '@deliveryapp/config';
import { LogsModule } from '@deliveryapp/logs';

import { set } from 'mongoose';

set('debug', process.env.NODE_ENV === 'development');

@Module({
  imports: [ConfigModule, LogsModule],
})
export class CoreModule {}
