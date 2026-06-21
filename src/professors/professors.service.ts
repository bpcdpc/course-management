import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProfessorsService {
  constructor(private readonly prisma: PrismaService) {}

  // 직번 발급
  async generateIdNumber(tx: Prisma.TransactionClient): Promise<string> {
    const prefix = `P${new Date().getFullYear().toString()}`;

    // 올해의 마지막 교수 찾기
    const lastProfessor = await tx.professor.findFirst({
      where: { idNumber: { startsWith: prefix } },
      orderBy: { idNumber: 'desc' },
    });

    // 없으면 prefix에 '0001'을 붙여서 반환
    if (!lastProfessor) {
      return `${prefix}0001`;
    }

    // 있으면 아래와 같이 처리
    // 1. 올해 마지막 교수의 직번에서 번호 부분을 추출한 후, 숫자로 변환한 후, 1을 더함
    const nextNumber = Number(lastProfessor.idNumber.slice(-4)) + 1;
    // 2. 4자리 문자열로 변환
    const nextString = nextNumber.toString().padStart(4, '0');
    // 3. prefix를 붙여서 반환
    return `${prefix}${nextString}`;
  }
}
