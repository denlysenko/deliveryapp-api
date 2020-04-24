import { Module } from '@nestjs/common';

import { ConfigService } from '@deliveryapp/config';
import { LogsService } from '@deliveryapp/logs';
import { UserEntity, USERS_REPOSITORY } from '@deliveryapp/repository';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [
    {
      provide: USERS_REPOSITORY,
      useValue: UserEntity,
    },
    {
      provide: UsersService,
      useFactory: (
        usersRepository,
        configService: ConfigService,
        logsService: LogsService,
      ) => new UsersService(usersRepository, configService, logsService),
      inject: [USERS_REPOSITORY, ConfigService, LogsService],
    },
  ],
})
export class UsersModule {}
