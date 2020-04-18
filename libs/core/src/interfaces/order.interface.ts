import { User } from './user.interface';

export interface Order {
  id?: number;
  cityFrom: string;
  cityTo: string;
  addressFrom: string;
  addressTo: string;
  cargoName: string;
  additionalData?: string;
  comment?: string;
  cargoWeight: number;
  cargoVolume?: number;
  senderName?: string;
  senderCompany?: string;
  senderEmail: string;
  senderPhone: string;
  status?: number;
  deliveryCosts?: number;
  deliveryDate?: Date;
  paid?: boolean;
  paymentDate?: Date;
  invoiceId?: number;
  creatorId?: number;
  creator?: Partial<User>;
  clientId?: number;
  client?: Partial<User>;
}
