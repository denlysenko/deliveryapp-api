import { Module } from '@nestjs/common';

import { DatabaseModule } from '@deliveryapp/database';

import { SettingsController } from './settings.controller';
import { settingsProviders } from './settings.providers';
import { SettingsService } from './settings.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SettingsController],
  providers: [SettingsService, ...settingsProviders],
})
export class SettingsModule {}