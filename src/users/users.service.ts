import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ProfessorsService } from '../professors/professors.service';
import { StudentsService } from '../students/students.service';
import * as bcrypt from 'bcrypt';
import { FindUsersDto } from './dto/find-users.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly professorsService: ProfessorsService,
    private readonly studentsService: StudentsService,
  ) {}

  // 응답에서 비밀번호 제거
  private excludePassword(user: any) {
    if (!user) return user;
    const { password, ...result } = user;
    return result;
  }

  // 사용자 생성 서비스
  async create(createUserDto: CreateUserDto) {
    // 트랜잭션 시작
    return await this.prisma.$transaction(async (tx) => {
      // 1. 이메일 중복 검사
      const exists = await tx.user.findUnique({
        where: { email: createUserDto.email },
      });

      if (exists) {
        throw new ConflictException(
          `${createUserDto.email}는 이미 사용중인 이메일입니다. (탈퇴한 계정 포함)`,
        );
      }

      // 2. 비밀번호 해싱 (기본값 0000)
      const hashed = await bcrypt.hash('0000', 10);

      // 3. user 생성
      const user = await tx.user.create({
        data: { ...createUserDto, password: hashed },
      });

      // 4. 역할에 따라 professor / student 생성
      if (createUserDto.role === 'PROFESSOR') {
        const idNumber = await this.professorsService.generateIdNumber(tx);
        await tx.professor.create({
          data: {
            idNumber,
            user: { connect: { id: user.id } },
          },
        });
      }

      if (createUserDto.role === 'STUDENT') {
        const idNumber = await this.studentsService.generateIdNumber(tx);
        await tx.student.create({
          data: { idNumber, user: { connect: { id: user.id } } },
        });
      }

      const finalUser = await tx.user.findUnique({
        where: { id: user.id },
        include: {
          professor: { select: { idNumber: true } },
          student: { select: { idNumber: true } },
        }, // professor, student 포함
      });

      return this.excludePassword(finalUser);
    });
  }

  // 사용자 목록 조회 서비스
  async findAll(findUsersDto: FindUsersDto) {
    const users = await this.prisma.user.findMany({
      where: { role: findUsersDto.role || undefined, deletedAt: null },
      orderBy: { id: 'asc' },
      include: {
        professor: { select: { idNumber: true } },
        student: { select: { idNumber: true } },
      }, // professor, student 포함
    });

    return users.map((user) => this.excludePassword(user));
  }

  // 사용자 조회 서비스
  async findOne(id: number) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        professor: { select: { idNumber: true } },
        student: { select: { idNumber: true } },
      }, // professor, student 포함
    });
    if (!user) {
      throw new NotFoundException(`${id} 사용자를 찾을 수 없습니다.`);
    }
    return this.excludePassword(user);
  }

  // 사용자 수정 서비스
  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    // 1. 이메일 수정 요청이 있을 경우에만 이메일 중복 검사
    if (updateUserDto.email) {
      const exists = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (exists && exists.id !== id) {
        throw new ConflictException(
          `${updateUserDto.email}는 이미 다른 사용자가 사용 중인 이메일입니다. (탈퇴한 계정 포함)`,
        );
      }
    }

    // user 업데이트
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: {
        professor: { select: { idNumber: true } },
        student: { select: { idNumber: true } },
      }, // professor, student 포함
    });

    return this.excludePassword(user);
  }

  // 사용자 삭제 서비스
  async remove(id: number) {
    await this.findOne(id);

    // soft delete
    const removed = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return this.excludePassword(removed);
  }
}
