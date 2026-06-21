import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AuthUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class ActivatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: AuthUser = request.user;

    if (!user.activated) {
      throw new ForbiddenException(`초기 비밀번호를 먼저 변경해주세요.`);
    }

    return true;
  }
}
