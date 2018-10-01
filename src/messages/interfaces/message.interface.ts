import { Document } from 'mongoose';

export interface Message extends Document {
  readonly recipientId: number;
  readonly text: string;
  readonly createdAt: Date;
  readonly forEmployee: boolean;
  readonly read: boolean;
}
