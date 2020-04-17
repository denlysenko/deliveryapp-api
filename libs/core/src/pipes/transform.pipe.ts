import { ValidationPipe } from '@nestjs/common';

export class TransformPipe extends ValidationPipe {
  constructor() {
    super({ transform: true });
  }
}
