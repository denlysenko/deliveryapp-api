import { ConfigService } from '@deliveryapp/config';
import { BaseResponse, Log, BaseQuery } from '@deliveryapp/core';

import { Model, Document } from 'mongoose';

interface LogModel extends Log, Document {}

export class LogsService {
  constructor(
    private readonly logModel: Model<LogModel>,
    private readonly configService: ConfigService,
  ) {}

  create(log: Log): Promise<Log> {
    return this.logModel.create(log);
  }

  async get(query: BaseQuery): Promise<BaseResponse<Log>> {
    const where = query.filter ?? {};
    const offset = query.offset ?? 0;
    const limit =
      query.limit ?? parseInt(this.configService.get('DEFAULT_LIMIT'), 10);

    const cursor = this.logModel
      .find(where)
      .skip(offset)
      .limit(limit)
      .sort(query.order);

    const [count, rows] = await Promise.all([
      this.logModel.countDocuments(where),
      cursor.exec(),
    ]);

    return {
      count,
      rows,
    };
  }
}
