import { User } from './user.interface';
import { Order } from './order.interface';

export interface Payment {
  id: number;
  method: number;
  status: boolean;
  total: number;
  paymentAmount: number;
  paymentDate: Date;
  dueDate: Date;
  notes: string;
  description: string;
  client: Partial<User>;
  creator: Partial<User>;
  orders: Order[];
}
