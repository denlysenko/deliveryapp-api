import { Document } from 'mongoose';

export interface Log extends Document {
  readonly action: number;
  readonly userId: number;
  readonly createdAt: Date;
  readonly data: any;
}
