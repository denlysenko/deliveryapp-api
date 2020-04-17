import { PipeTransform, Injectable } from '@nestjs/common';

import { transform } from 'lodash';
import { Op } from 'sequelize';

import { BaseQuery } from '../interfaces';

@Injectable()
export class SequelizeQueryPipe implements PipeTransform<object, object> {
  transform(value: BaseQuery): BaseQuery {
    const where = { ...value.filter };

    const transformedFilter = transform(
      where,
      (result, value, key: string) => {
        switch (key) {
          case 'id':
          case 'role': {
            return value && Object.assign(result, { [key]: value });
          }
        }

        return Object.assign(result, { [key]: { [Op.like]: `%${value}%` } });
      },
      {},
    );

    return {
      ...value,
      filter: transformedFilter,
    };
  }
}
