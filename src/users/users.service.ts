import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuthErrors, UserErrors } from 'common/enums/validation-errors.enum';
import { BaseResponse } from 'common/interfaces/base-response.interface';
import { ConfigService } from 'config/config.service';
import * as _ from 'lodash';
import { Op, Sequelize, ValidationError, ValidationErrorItem } from 'sequelize';

import { PasswordDto } from './dto/password.dto';
import { UserDto } from './dto/user.dto';
import { Address } from './entities/address.entity';
import { BankDetails } from './entities/bank-details.entity';
import { User } from './entities/user.entity';

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

@Injectable()
export class UsersService {
  constructor(
    @Inject('UsersRepository') private readonly usersRepository: typeof User,
    @Inject('Sequelize') private readonly sequelize: Sequelize,
    private readonly configService: ConfigService,
  ) {}

  async create(userDto: UserDto): Promise<User> {
    return await User.create(userDto, { raw: true });
  }

  async update(id: number, userDto: UserDto): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException(UserErrors.USER_NOT_FOUND_ERR);
    }

    await this.sequelize.transaction(async transaction => {
      const { address, bankDetails, ...updatedUser } = userDto;
      const promises = [];

      user.set(updatedUser);
      promises.push(user.save({ transaction }));

      if (!_.isEmpty(address)) {
        promises.push(
          user.address && user.address.id
            ? user.address.update(address, { transaction })
            : user.$create('Address', address, { transaction }),
        );
      }

      if (!_.isEmpty(bankDetails)) {
        promises.push(
          user.bankDetails && user.bankDetails.id
            ? user.bankDetails.update(bankDetails, { transaction })
            : user.$create('BankDetails', bankDetails, { transaction }),
        );
      }

      await Promise.all(promises);
    });

    // refetch with includes
    return await this.findById(id);
  }

  async changePassword(id: number, passwordDto: PasswordDto): Promise<void> {
    const user = await this.usersRepository.findById(id);
    const { oldPassword, newPassword } = passwordDto;

    if (!user.authenticate(oldPassword)) {
      const name = 'ValidationError';
      throw new ValidationError(name, [
        new ValidationErrorItem(
          AuthErrors.INCORRECT_PASSWORD_ERR,
          '',
          'oldPassword',
          oldPassword,
        ),
      ]);
    }

    user.password = newPassword;
    await user.save();
  }

  async findAll(query?: any): Promise<BaseResponse<User>> {
    const where = _.transform(
      query.filter || {},
      (result, value, key: string) => {
        switch (key) {
          case 'role':
          case 'id': {
            return value && Object.assign(result, { [key]: value }); // destructuring not working here
          }
        }

        return Object.assign(result, { [key]: { [Op.like]: `%${value}%` } });
      },
      {},
    );

    const order: Array<[string, string]> = _.toPairs(query.order || {});

    return await this.usersRepository.findAndCountAll({
      where,
      limit:
        Number(query.limit) || Number(this.configService.get('DEFAULT_LIMIT')),
      offset: Number(query.offset) || 0,
      order: order.length ? order : [['id', 'asc']],
      attributes: USER_ATTRIBUTES,
    });
  }

  async findById(id: number): Promise<User> {
    return await this.usersRepository.findById(id, {
      attributes: USER_ATTRIBUTES,
      include: [{ model: Address }, { model: BankDetails }],
    });
  }

  async findByEmail(email: string): Promise<User> {
    return await this.usersRepository.findOne({ where: { email } });
  }
}
