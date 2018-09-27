import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserValidationErrors } from 'common/enums/validation-errors.enum';
import { ApiResponse } from 'common/interfaces/api-response.interface';
import { ConfigService } from 'config/config.service';
import * as _ from 'lodash';
import { Op } from 'sequelize';

import { UserDto } from './dto/user.dto';
import { Address } from './entities/address.entity';
import { BankDetails } from './entities/bank-details.entity';
import { User } from './entities/user.entity';

// import { PasswordDto } from './models/password/password.dto';

// import { BadRequestException } from '../../common/exceptions/bad-request.exception';
// import { ServerError } from '../../common/exceptions/server.error';

const USER_ATTRIBUTES = [
  'id',
  'firstName',
  'lastName',
  'company',
  'email',
  'phone',
  'role',
  'createdAt',
];

@Injectable()
export class UsersService {
  constructor(
    @Inject('UsersRepository') private readonly usersRepository: typeof User,
    private readonly configService: ConfigService,
  ) {}

  async create(userDto: UserDto): Promise<User> {
    const user = new User(userDto);
    return await user.save();
  }

  async update(id: number, userDto: UserDto): Promise<User> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException(UserValidationErrors.USER_NOT_FOUND_ERR);
    }

    const { address, bankDetails, ...updatedUser } = userDto;

    user.set(updatedUser);

    const promises = [];

    if (!_.isEmpty(address)) {
      promises.push(user.$set('Address', Address.build(address)));
    }

    if (!_.isEmpty(bankDetails)) {
      promises.push(user.$set('BankDetails', BankDetails.build(bankDetails)));
    }

    if (promises.length) {
      await Promise.all(promises);
    }

    return await user.save();
  }

  // async changePassword(id: number, passwordDto: PasswordDto): Promise<void> {
  //   const user = await this.usersRepository.findById(id);

  //   if (!user.authenticate(passwordDto.oldPassword)) {
  //     throw new BadRequestException(
  //       new ServerError('BadRequestError', [
  //         new ValidationErrorItem(
  //           'INCORRECT_PASSWORD_ERR',
  //           '',
  //           'oldPassword',
  //           passwordDto.oldPassword
  //         )
  //       ])
  //     );
  //   }

  //   user.password = passwordDto.newPassword;
  //   await user.save();
  // }

  async findAll(query?: any): Promise<ApiResponse<User>> {
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
      limit: +query.limit || Number(this.configService.get('DEFAULT_LIMIT')),
      offset: +query.offset || 0,
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
