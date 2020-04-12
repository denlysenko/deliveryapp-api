import { Module } from '@nestjs/common';

import { ConfigService } from '@deliveryapp/config';
import { LogsService } from '@deliveryapp/logs';
import { UserEntity, USERS_REPOSITORY } from '@deliveryapp/repository';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: USERS_REPOSITORY,
      useValue: UserEntity,
    },
    {
      provide: AuthService,
      useFactory: (
        configService: ConfigService,
        logsService: LogsService,
        usersRepository,
      ) => new AuthService(configService, logsService, usersRepository),
      inject: [ConfigService, LogsService, USERS_REPOSITORY],
    },
    {
      provide: JwtStrategy,
      useFactory: (configService: ConfigService, authService: AuthService) =>
        new JwtStrategy(configService, authService),
      inject: [ConfigService, AuthService],
    },
  ],
})
export class AuthModule {}
