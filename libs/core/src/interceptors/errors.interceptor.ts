import {
  CallHandler,
  Injectable,
  NestInterceptor,
  UnprocessableEntityException,
} from '@nestjs/common';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ValidationError as SequelizeValidationError } from 'sequelize';

import { ValidationError, ValidationErrorItem } from '../models';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(_: unknown, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) =>
        throwError(
          err instanceof SequelizeValidationError
            ? new UnprocessableEntityException(
                new ValidationError(
                  'ValidationError',
                  err.errors.map(
                    (error) =>
                      new ValidationErrorItem(
                        [error.message],
                        error.path,
                        error.value,
                      ),
                  ),
                ),
              )
            : err,
        ),
      ),
    );
  }
}
