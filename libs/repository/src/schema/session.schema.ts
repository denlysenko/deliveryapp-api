import { Schema } from 'mongoose';

export const SessionSchema = new Schema({
  socketId: String,
  userId: Number,
});
