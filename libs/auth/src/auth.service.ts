import { BadRequestException, Injectable } from '@nestjs/common';

import { AuthErrors, LogActions } from '@deliveryapp/common';
import { ConfigService } from '@deliveryapp/config';
import {
  AuthPayload,
  CreateUserDto,
  JwtPayload,
  User,
} from '@deliveryapp/core';
import { LogDto, LogsService } from '@deliveryapp/logs';
import { UserEntity } from '@deliveryapp/repository';

import * as jwt from 'jsonwebtoken';

@Injectable()
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

  async register(createUserDto: CreateUserDto): Promise<AuthPayload> {
    const user = UserEntity.build(createUserDto);

    await user.save();
    await this.logsService.create(
      // TODO: rename
      new LogDto({
        action: LogActions.REGISTRATION,
        userId: user.id,
        createdAt: new Date(),
      }),
    );

    return { token: this.createToken(user.id) };
  }

  async validate({ id }: JwtPayload): Promise<User> {
    return await this.usersRepository.findByPk(id, {
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
