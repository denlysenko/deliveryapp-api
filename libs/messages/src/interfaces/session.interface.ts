import { Document } from 'mongoose';

export interface Session extends Document {
  readonly socketId: string;
  readonly userId: number;
}
