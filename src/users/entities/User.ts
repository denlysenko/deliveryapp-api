import { Role } from 'common/enums/roles.enum';
import { UserErrors } from 'common/enums/validation-errors.enum';

import * as crypto from 'crypto';

import {
  AllowNull,
  AutoIncrement,
  BeforeCreate,
  BeforeUpdate,
  Column,
  DataType,
  Default,
  HasOne,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import { Address } from './Address';
import { BankDetails } from './BankDetails';

const DEFAULT_BYTE_SIZE = 16;
const DEFAULT_ITERATIONS = 10000;
const DEFAULT_KEY_LENGTH = 64;

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'users',
})
export class User extends Model<User> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(45),
    unique: {
      name: 'unique_email_idx',
      msg: UserErrors.UNIQUE_EMAIL_ERR,
    },
    validate: {
      isEmail: {
        msg: UserErrors.INVALID_EMAIL_ERR,
      },
      notEmpty: {
        msg: UserErrors.EMAIL_REQUIRED_ERR,
      },
    },
  })
  email: string;

  @Column
  firstName: string;

  @Column
  lastName: string;

  @Column
  company: string;

  @Column
  phone: string;

  @Default(Role.CLIENT)
  @Column(DataType.INTEGER)
  role: number;

  @AllowNull(false)
  @Column({
    type: DataType.VIRTUAL,
    validate: {
      notEmpty: {
        msg: UserErrors.PASSWORD_REQUIRED_ERR,
      },
    },
  })
  password: string;

  @Column
  hashedPassword: string;

  @Column
  salt: string;

  @BeforeCreate
  static async createPassword(user: User) {
    await user._updatePassword();
  }

  @BeforeUpdate
  static async updatePassword(user: User) {
    if (user.changed('password')) {
      await user._updatePassword();
    }
  }

  authenticate(password: string): boolean {
    return this.hashedPassword === this.encryptPassword(password);
  }

  private encryptPassword(password: string): string {
    const salt = new Buffer(this.salt, 'base64');
    return crypto
      .pbkdf2Sync(
        password,
        salt,
        DEFAULT_ITERATIONS,
        DEFAULT_KEY_LENGTH,
        'sha512',
      )
      .toString('base64');
  }

  private async makeSalt(): Promise<string> {
    return crypto.randomBytes(DEFAULT_BYTE_SIZE).toString('base64');
  }

  private async _updatePassword() {
    if (this.password) {
      this.salt = await this.makeSalt();
      this.hashedPassword = this.encryptPassword(this.password);
    }
  }

  @HasOne(() => Address, 'userId')
  address: Address;

  @HasOne(() => BankDetails, 'userId')
  bankDetails: BankDetails;
}
