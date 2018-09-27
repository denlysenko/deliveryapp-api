import { Module } from '@nestjs/common';
import { AuthModule } from 'auth/auth.module';
import { ConfigModule } from 'config/config.module';
import { UsersModule } from 'users/users.module';

@Module({
  imports: [ConfigModule, AuthModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
