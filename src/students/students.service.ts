import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async generateIdNumber(tx: Prisma.TransactionClient): Promise<string> {
    const prefix = new Date().getFullYear().toString();

    // 올해의 마지막 학생 찾기
    const lastStudent = await tx.student.findFirst({
      where: { idNumber: { startsWith: prefix } },
      orderBy: { idNumber: 'desc' },
    });

    // 없으면 1번 부여해서 반환
    if (!lastStudent) {
      return `${prefix}0001`;
    }

    // 있으면 다음 번호 부여해서 반환
    const nextNumber = Number(lastStudent.idNumber.slice(-4)) + 1;
    const nextString = nextNumber.toString().padStart(4, '0');

    return `${prefix}${nextString}`;
  }
}
