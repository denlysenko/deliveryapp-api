import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthErrors } from 'common/enums/validation-errors.enum';
import { ConfigService } from 'config/config.service';
import * as jwt from 'jsonwebtoken';
import { UserDto } from 'users/dto/user.dto';
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

  async signup(user: UserDto): Promise<AuthPayload> {
    const newUser = await this.usersService.create(user);
    return { token: this.createToken(newUser.id) };
  }

  validate({ id }): Promise<User> {
    return this.usersService.findById(id);
  }

  private createToken(id: number): string {
    return jwt.sign({ id }, this.configService.get('JWT_SECRET'), {
      expiresIn: Number(this.configService.get('TOKEN_EXPIRATION_TIME')),
    });
  }
}
