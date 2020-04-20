import { Module } from '@nestjs/common';

import { LogsService } from '@deliveryapp/logs';
import {
  AddressEntity,
  ADDRESS_REPOSITORY,
  BankDetailsEntity,
  BANK_DETAILS_REPOSITORY,
} from '@deliveryapp/repository';

import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  controllers: [SettingsController],
  providers: [
    {
      provide: SettingsService,
      useFactory: (
        addressRepository,
        bankDetailsRepository,
        logsService: LogsService,
      ) =>
        new SettingsService(
          addressRepository,
          bankDetailsRepository,
          logsService,
        ),
      inject: [ADDRESS_REPOSITORY, BANK_DETAILS_REPOSITORY, LogsService],
    },
    {
      provide: ADDRESS_REPOSITORY,
      useValue: AddressEntity,
    },
    {
      provide: BANK_DETAILS_REPOSITORY,
      useValue: BankDetailsEntity,
    },
  ],
})
export class SettingsModule {}
