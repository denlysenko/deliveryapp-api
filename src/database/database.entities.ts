import { Order } from 'orders/entities';
import { Payment } from 'payments/entities';
import { CompanyAddress, CompanyBankDetails } from 'settings/entities';
import { Address, BankDetails, User } from 'users/entities';

export const entities = [
  User,
  BankDetails,
  Address,
  Order,
  Payment,
  CompanyAddress,
  CompanyBankDetails,
];
