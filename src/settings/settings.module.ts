import { Module } from '@nestjs/common';
import { DatabaseModule } from 'database/database.module';
import { LogsModule } from 'logs/logs.module';

import { SettingsController } from './settings.controller';
import { settingsProviders } from './settings.providers';
import { SettingsService } from './settings.service';

@Module({
  imports: [DatabaseModule, LogsModule],
  controllers: [SettingsController],
  providers: [SettingsService, ...settingsProviders],
})
export class SettingsModule {}
