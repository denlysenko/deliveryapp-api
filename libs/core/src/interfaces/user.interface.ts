import { Address } from './address.interface';
import { BankDetails } from './bank-details.interface';

export interface User {
  id?: number;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  role?: number;
  address?: Address;
  bankDetails?: BankDetails;
}
