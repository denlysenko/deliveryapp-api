export interface Message {
  _id?: any;
  recipientId?: number;
  text: string;
  createdAt?: Date;
  forEmployee?: boolean;
  read?: boolean;
}
