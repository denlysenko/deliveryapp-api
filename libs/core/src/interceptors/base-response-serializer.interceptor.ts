import {
  CallHandler,
  ClassSerializerInterceptor,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';

import { classToPlain } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseResponse } from '../interfaces';

export class BaseResponseSerializerInterceptor
  extends ClassSerializerInterceptor
  implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((res: BaseResponse<unknown>) => ({
        count: res.count,
        rows: res.rows.map((row) => classToPlain(row)),
      })),
    );
  }
}
