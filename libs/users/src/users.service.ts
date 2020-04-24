import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { AuthErrors, LogActions, Role, UserErrors } from '@deliveryapp/common';
import { ConfigService } from '@deliveryapp/config';
import {
  BaseQuery,
  BaseResponse,
  ChangePasswordPayload,
  Log,
  User,
  ValidationError,
  ValidationErrorItem,
} from '@deliveryapp/core';
import { LogsService } from '@deliveryapp/logs';
import { UserEntity } from '@deliveryapp/repository';

import { isEmpty, isNil } from 'lodash';
import { Op, WhereOptions } from 'sequelize';

const USER_ATTRIBUTES = [
  'id',
  'firstName',
  'lastName',
  'company',
  'email',
  'phone',
  'role',
  'createdAt',
  'updatedAt',
];

export class UsersService {
  constructor(
    private readonly usersRepository: typeof UserEntity,
    private readonly configService: ConfigService,
    private readonly logsService: LogsService,
  ) {}

  async create(userDto: User, user: Partial<User>): Promise<{ id: number }> {
    const createdUser: UserEntity = await UserEntity.create(userDto);

    await this.logsService.create(
      new Log({
        action: LogActions.CREATE_USER,
        userId: user.id,
        createdAt: new Date(),
        data: {
          id: createdUser.id,
        },
      }),
    );

    return { id: createdUser.id };
  }

  async updateProfile(
    id: number,
    userDto: Partial<User>,
    { role }: Partial<User>,
  ): Promise<{ id: number }> {
    const user: UserEntity = await this.usersRepository
      .scope(['address', 'bankDetails'])
      .findByPk(id);

    if (isNil(user)) {
      throw new NotFoundException(UserErrors.USER_NOT_FOUND_ERR);
    }

    const updatedUser = await this.usersRepository.sequelize.transaction(
      async (transaction) => {
        const { address, bankDetails, ...updatedUser } = userDto;
        const promises = [];

        promises.push(user.update(updatedUser, { transaction }));

        if (role === Role.CLIENT && !isEmpty(address)) {
          promises.push(
            user.address && user.address.id
              ? user.address.update(address, { transaction })
              : user.$create('Address', address, { transaction }),
          );
        }

        if (role === Role.CLIENT && !isEmpty(bankDetails)) {
          promises.push(
            user.bankDetails && user.bankDetails.id
              ? user.bankDetails.update(bankDetails, { transaction })
              : user.$create('BankDetails', bankDetails, { transaction }),
          );
        }

        await Promise.all(promises);

        return user;
      },
    );

    await this.logsService.create(
      new Log({
        action: LogActions.UPDATE_PROFILE,
        userId: updatedUser.id,
        createdAt: new Date(),
      }),
    );

    return { id: updatedUser.id };
  }

  async updateUser(
    id: number,
    userDto: Partial<User>,
    user: Partial<User>,
  ): Promise<{ id: number }> {
    const updatedUser: UserEntity = await this.usersRepository.findOne({
      where: { id, role: { [Op.in]: [Role.MANAGER, Role.ADMIN] } },
    });

    if (isNil(updatedUser)) {
      throw new NotFoundException(UserErrors.USER_NOT_FOUND_ERR);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { address, bankDetails, ...rest } = userDto;

    await updatedUser.update(rest);

    await this.logsService.create(
      new Log({
        action: LogActions.UPDATE_USER,
        userId: user.id,
        createdAt: new Date(),
        data: {
          id: updatedUser.id,
        },
      }),
    );

    return { id: updatedUser.id };
  }

  async changePassword(
    id: number,
    passwordDto: ChangePasswordPayload,
  ): Promise<void> {
    const user: UserEntity = await this.usersRepository.findByPk(id);

    const { oldPassword, newPassword } = passwordDto;

    if (isNil(user)) {
      throw new NotFoundException(UserErrors.USER_NOT_FOUND_ERR);
    }

    if (!user.authenticate(oldPassword)) {
      const error = new ValidationError('ValidationError', [
        new ValidationErrorItem(
          [AuthErrors.INCORRECT_PASSWORD_ERR],
          'oldPassword',
          oldPassword,
        ),
      ]);

      throw new UnprocessableEntityException(error);
    }

    user.password = newPassword;

    await user.save();

    await this.logsService.create(
      new Log({
        action: LogActions.CHANGE_PASSWORD,
        userId: user.id,
        createdAt: new Date(),
      }),
    );
  }

  findUsers(
    query: BaseQuery,
    user: Partial<User>,
  ): Promise<BaseResponse<User>> {
    if (query.filter && query.filter['id'] && query.filter['id'] === user.id) {
      return Promise.resolve({
        count: 0,
        rows: [],
      });
    }

    const where: WhereOptions = {
      role: { [Op.in]: [Role.MANAGER, Role.ADMIN] },
      id: { [Op.notIn]: [user.id] },
      ...query.filter,
    };

    const offset = query.offset ?? 0;
    const limit =
      query.limit ?? parseInt(this.configService.get('DEFAULT_LIMIT'), 10);
    const order: [string, string][] = query.order
      ? Object.entries(query.order)
      : [['id', 'desc']];

    return this.usersRepository.findAndCountAll({
      where,
      limit,
      offset,
      order,
      attributes: USER_ATTRIBUTES,
      raw: true,
    });
  }

  async findUser(id: number, user: Partial<User>): Promise<User> {
    if (id === user.id) {
      throw new NotFoundException(UserErrors.USER_NOT_FOUND_ERR);
    }

    const foundUser: UserEntity = await this.usersRepository.findOne({
      where: { id, role: { [Op.in]: [Role.MANAGER, Role.ADMIN] } },
      attributes: USER_ATTRIBUTES,
      raw: true,
    });

    if (isNil(foundUser)) {
      throw new NotFoundException(UserErrors.USER_NOT_FOUND_ERR);
    }

    return foundUser;
  }

  async findProfile(user: Partial<User>): Promise<User> {
    const { id, role } = user;
    const scope = role === Role.CLIENT ? ['address', 'bankDetails'] : null;

    const profile: UserEntity = await this.usersRepository
      .scope(scope)
      .findByPk(id, {
        attributes: USER_ATTRIBUTES,
      });

    if (isNil(profile)) {
      throw new NotFoundException(UserErrors.USER_NOT_FOUND_ERR);
    }

    return profile.toJSON() as User;
  }
}
