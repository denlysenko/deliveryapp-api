import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { BaseResponse } from '@deliveryapp/common';
import { ConfigService } from '@deliveryapp/config';

import { Model } from 'mongoose';

import { LogDto } from './dto/log.dto';
import { Log } from './interfaces/log.interface';

@Injectable()
export class LogsService {
  constructor(
    @InjectModel('Log') private readonly logModel: Model<Log>,
    private readonly configService: ConfigService,
  ) {}

  async create(logDto: LogDto): Promise<Log> {
    const createdLog = new this.logModel(logDto);
    return await createdLog.save();
  }

  async get(query?: any): Promise<BaseResponse<Log>> {
    const conditions = query.filter || {};
    const count = await this.logModel.countDocuments(conditions);
    const rows = await this.logModel
      .find(conditions)
      .skip(Number(query.offset) || 0)
      .limit(
        Number(query.limit) || Number(this.configService.get('DEFAULT_LIMIT')),
      )
      .sort(query.order)
      .exec();

    return {
      count,
      rows,
    };
  }
}
