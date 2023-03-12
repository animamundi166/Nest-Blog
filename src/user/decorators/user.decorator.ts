import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';

type TypeData = keyof UserEntity;

export const User = createParamDecorator(
  (data: TypeData, ctx: ExecutionContext) => {
    const { user } = ctx.switchToHttp().getRequest<{ user: UserEntity }>();

    return data ? user[data] : user;
  },
);
