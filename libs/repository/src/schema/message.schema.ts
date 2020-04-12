import { Schema } from 'mongoose';

export const MessageSchema = new Schema({
  recipientId: Number,
  text: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  forEmployee: {
    type: Boolean,
    default: false,
  },
  read: {
    type: Boolean,
    default: false,
  },
});
