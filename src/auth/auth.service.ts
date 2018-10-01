import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthErrors } from 'common/enums/validation-errors.enum';
import { ConfigService } from 'config/config.service';
import * as jwt from 'jsonwebtoken';
import { User } from 'users/entities';
import { UsersService } from 'users/users.service';

import { AuthPayload } from './interfaces/auth-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async login(email: string, password: string): Promise<AuthPayload> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new BadRequestException(AuthErrors.INCORRECT_EMAIL_ERR);
    }

    if (!user.authenticate(password)) {
      throw new BadRequestException(AuthErrors.INCORRECT_PASSWORD_ERR);
    }

    return { token: this.createToken(user.id) };
  }

  async validate({ id }): Promise<User> {
    return await this.usersService.findById(id);
  }

  createToken(id: number): string {
    return jwt.sign({ id }, this.configService.get('JWT_SECRET'), {
      expiresIn: Number(this.configService.get('TOKEN_EXPIRATION_TIME')),
    });
  }
}
