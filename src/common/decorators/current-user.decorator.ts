import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '@prisma/client';

export interface AuthUser {
  id: number;
  role: Role;
  idNumber: string;
  activated: boolean;
}

export const CurrentUser = createParamDecorator(
  (
    field: keyof AuthUser, // id, role, idNumber
    ctx: ExecutionContext, // nestjs 제공하는 요청 컨텍스트 httpRequest
  ) => {
    // Http 요청 객체(req)을 꺼낸다. from NESTJS 요청 컨텍스트에서
    const request = ctx.switchToHttp().getRequest();
    // JWtStrategy.validate 가 채워둔 사용자 정보를 꺼낸다.
    const user: AuthUser = request.user;
    // field 가 있으면 한필드만 없으면 객체 전체 반환
    // @CurrentUser("id") --> user.id
    // @CurrentUser()     --> user (전체)
    return field ? user?.[field] : user;
  },
);
