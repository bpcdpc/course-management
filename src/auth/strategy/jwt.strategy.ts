import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // 헤더 항목 중
      // Authorization : Bearer <토큰>
      // 에서 jwt 부분을 추출
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 만료된 토큰은 거부 (AuthModule signOption.expiresIn)
      ignoreExpiration: false,
      // 로그인 시에 sign()에 쓴 secret 과 동일해야 검증 성공
      secretOrKey: process.env.JWT_SECRET || 'fallbackSecret',
    });
  }

  // 토큰이 유효하면 실행되는 메서드 : 반환값을 Request 객체(req.user)에 담아줌.
  async validate(payload: any) {
    return {
      id: payload.sub,
      role: payload.role,
      idNumber: payload.idNumber,
      activated: payload.activated,
    };
  }
}
