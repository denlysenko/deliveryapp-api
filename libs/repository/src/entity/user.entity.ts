import { Role, UserErrors } from '@deliveryapp/common';
import { User } from '@deliveryapp/core';

import * as crypto from 'crypto';
import {
  AllowNull,
  BeforeCreate,
  BeforeUpdate,
  Column,
  DataType,
  Default,
  HasOne,
  Scopes,
  Table,
} from 'sequelize-typescript';

import { AddressEntity } from './address.entity';
import { BankDetailsEntity } from './bank-details.entity';
import { BaseEntity } from './base-entity';

const DEFAULT_BYTE_SIZE = 16;
const DEFAULT_ITERATIONS = 10000;
const DEFAULT_KEY_LENGTH = 64;

@Scopes(() => ({
  address: {
    include: [AddressEntity],
  },
  bankDetails: {
    include: [BankDetailsEntity],
  },
}))
@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'users',
})
export class UserEntity extends BaseEntity<UserEntity> implements User {
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
  @Column
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

  @HasOne(() => AddressEntity, 'userId')
  address: AddressEntity;

  @HasOne(() => BankDetailsEntity, 'userId')
  bankDetails: BankDetailsEntity;

  @BeforeCreate
  static async createPassword(user: UserEntity) {
    await user._updatePassword();
  }

  @BeforeUpdate
  static async updatePassword(user: UserEntity) {
    if (user.changed('password')) {
      await user._updatePassword();
    }
  }

  authenticate(password: string): boolean {
    return this.hashedPassword === this.encryptPassword(password);
  }

  private encryptPassword(password: string): string {
    const salt = Buffer.from(this.salt, 'base64');
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
}
