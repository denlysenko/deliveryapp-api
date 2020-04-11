import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
  CallHandler,
} from '@nestjs/common';
import { ValidationError } from 'sequelize';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(_, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        catchError(err =>
          throwError(
            err instanceof ValidationError
              ? new HttpException(
                  this.adjustSequelizeValidationError(err),
                  HttpStatus.UNPROCESSABLE_ENTITY,
                )
              : err,
          ),
        ),
      );
  }

  private adjustSequelizeValidationError(error: any): ValidationError {
    const name = 'ValidationError';
    const errors = error.errors.map(err => {
      delete err.instance;
      delete err.original;
      return err;
    });

    return new ValidationError(name, errors);
  }
}
