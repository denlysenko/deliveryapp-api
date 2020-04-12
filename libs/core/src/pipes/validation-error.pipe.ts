import {
  ValidationPipe,
  ValidationError as Error,
  UnprocessableEntityException,
} from '@nestjs/common';

import { ValidationError, ValidationErrorItem } from '../models';

export class ValidationErrorPipe extends ValidationPipe {
  createExceptionFactory() {
    return (errors: Error[]) =>
      new UnprocessableEntityException(
        new ValidationError(
          'ValidationError',
          errors.map(
            (err) =>
              new ValidationErrorItem(
                Object.values(err.constraints),
                err.property,
                err.value,
              ),
          ),
        ),
      );
  }
}
