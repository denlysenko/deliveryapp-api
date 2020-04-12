import { Schema } from 'mongoose';

export const LogSchema = new Schema({
  action: Number,
  userId: Number,
  createdAt: Date,
  data: {},
});
