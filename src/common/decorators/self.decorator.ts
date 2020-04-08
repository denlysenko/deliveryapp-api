import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Self = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().user;
  },
);
