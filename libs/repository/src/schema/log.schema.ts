import { Schema } from 'mongoose';

export const LogSchema = new Schema({
  action: Number,
  userId: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  data: {},
});
