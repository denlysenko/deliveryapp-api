export class MessageDto {
  readonly recipientId?: number;
  readonly text: string;
  readonly createdAt?: Date;
  readonly forEmployee?: boolean;
  readonly read?: boolean;

  constructor(options: MessageDto) {
    Object.assign(this, options);
  }
}
