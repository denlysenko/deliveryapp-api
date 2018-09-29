import { createParamDecorator } from '@nestjs/common';

export const Self = createParamDecorator((_, req) => {
  return req.user;
});
