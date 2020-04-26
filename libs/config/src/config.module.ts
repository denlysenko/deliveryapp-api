import { Global, Module } from '@nestjs/common';

import { ConfigService } from './config.service';

@Global()
@Module({
  providers: [
    {
      provide: ConfigService,
      useFactory: () => new ConfigService(`${__dirname}/.env`),
    },
  ],
  exports: [ConfigService],
})
export class ConfigModule {}
