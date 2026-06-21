import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

import * as bcrypt from 'bcrypt';
import { AdminLoginDto } from './dto/admin-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // 로그인 서비스
  async login(loginDto: LoginDto) {
    // 학번이나 직번중 매칭되는 아이템을 먼저 가져옴
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { student: { idNumber: loginDto.idNumber } },
          { professor: { idNumber: loginDto.idNumber } },
        ],
        deletedAt: null,
      },
      include: { professor: true, student: true },
    });

    // 사용자가 없을 경우
    if (!user) {
      throw new UnauthorizedException(
        `학번/직번 또는 비밀번호가 잘못되었습니다.`,
      );
    }

    // 비밀번호가 틀렸을 경우
    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException(
        `학번/직번 또는 비밀번호가 잘못되었습니다.`,
      );
    }

    // 응답에 돌려 줄 학번/직번을 생성
    const idNumber = user.student?.idNumber || user.professor?.idNumber;

    // 토큰 발급에 쓰일 인자 생성
    const payload = {
      sub: user.id,
      role: user.role,
      idNumber: idNumber,
      activated: user.activated,
    };

    // access_token 을 생성해서 반환
    return { access_token: this.jwtService.sign(payload) };
  }

  // 관리자 로그인 서비스
  async loginAdmin(adminLoginDto: AdminLoginDto) {
    // 이메일과 역할이 매칭되는 아이템을 가져옴
    const user = await this.prisma.user.findFirst({
      where: {
        email: adminLoginDto.email,
        role: 'ADMIN',
        deletedAt: null,
      },
    });

    // 없으면 에러 발생
    if (!user) {
      throw new UnauthorizedException(`이메일 또는 비밀번호가 잘못되었습니다.`);
    }

    // 있으면 비번 검사
    const isMatch = await bcrypt.compare(adminLoginDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException(`이메일 또는 비밀번호가 잘못되었습니다.`);
    }

    // 토큰 발급에 쓰일 인자 생성 (학번/직번 없음)
    const payload = {
      sub: user.id,
      role: user.role,
      activated: user.activated,
    };

    return { access_token: this.jwtService.sign(payload) };
  }
}
