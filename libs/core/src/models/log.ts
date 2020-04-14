import { ILog } from '../interfaces';

export class Log implements ILog {
  action: number;
  userId: number;
  createdAt: Date;
  data?: any = null;

  constructor(options: ILog) {
    Object.assign(this, options);
  }
}