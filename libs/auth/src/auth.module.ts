import { Module } from '@nestjs/common';

import { DatabaseModule } from '@deliveryapp/database';
import { UsersModule } from '@deliveryapp/users';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [DatabaseModule, UsersModule],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
