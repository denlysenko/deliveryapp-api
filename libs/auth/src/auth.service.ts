import { BadRequestException } from '@nestjs/common';

import { AuthErrors, LogActions } from '@deliveryapp/common';
import { ConfigService } from '@deliveryapp/config';
import { AuthPayload, JwtPayload, User } from '@deliveryapp/core';
import { LogsService } from '@deliveryapp/logs';
import { UserEntity } from '@deliveryapp/repository';

import * as jwt from 'jsonwebtoken';

export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logsService: LogsService,
    private readonly usersRepository: typeof UserEntity,
  ) {}

  async login(email: string, password: string): Promise<AuthPayload> {
    const user = await this.usersRepository.findOne({
      where: { email },
      attributes: ['id', 'hashedPassword', 'salt'],
    });

    if (!user || !user.authenticate(password)) {
      throw new BadRequestException(AuthErrors.INCORRECT_EMAIL_OR_PASSWORD_ERR);
    }

    return { token: this.createToken(user.id) };
  }

  async register(createUserDto: User): Promise<AuthPayload> {
    const user = UserEntity.build(createUserDto);

    await user.save();

    this.logsService
      .create({
        action: LogActions.REGISTRATION,
        userId: user.id,
      })
      .catch((err: unknown) => {
        console.error(err);
      });

    return { token: this.createToken(user.id) };
  }

  validate({ id }: JwtPayload): Promise<User | null> {
    return this.usersRepository.findByPk(id, {
      attributes: ['id', 'role'],
      raw: true,
    });
  }

  createToken(id: number): string {
    return jwt.sign({ id }, this.configService.get('JWT_SECRET'), {
      expiresIn: Number(this.configService.get('TOKEN_EXPIRATION_TIME')),
    });
  }
}
