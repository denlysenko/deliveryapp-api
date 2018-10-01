export class SessionDto {
  readonly socketId: string;
  readonly userId: number;

  constructor(options: SessionDto) {
    Object.assign(this, options);
  }
}
