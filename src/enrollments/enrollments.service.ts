import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { PrismaService } from '../prisma/prisma.service';
import { getCurrentYearAndSemester } from '../common/utils/get-current-semester';
import { AuthUser } from '../common/decorators/current-user.decorator';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  // 수강 신청 생성 서비스
  async create(userId: number, createEnrollmentDto: CreateEnrollmentDto) {
    // 현재 년도와 학기 설정
    const { currentYear, currentSemester } = getCurrentYearAndSemester();

    // 수강신청하려는 과목 검사
    const course = await this.prisma.course.findUnique({
      where: { id: createEnrollmentDto.courseId },
    });
    if (!course) {
      throw new NotFoundException(
        `${createEnrollmentDto.courseId} 수업을 찾을 수 없습니다.`,
      );
    }

    // 수강신청 하려는 과목의 시간 모음
    const targetTimeTables = await this.prisma.timeTable.findMany({
      where: { courseId: createEnrollmentDto.courseId },
      select: {
        dayOfWeek: true,
        hour: true,
      },
    });

    // 그 시간 모음과 겹치는 enrollment
    const exists = await this.prisma.timeTable.findMany({
      where: {
        OR: targetTimeTables.map((t) => ({
          dayOfWeek: t.dayOfWeek,
          hour: t.hour,
        })),
        course: {
          year: currentYear,
          semesterType: currentSemester,
          enrolled: {
            some: { studentId: userId },
          },
        },
      },
    });

    // 겹치는 데이터가 있으면 Conflict 에러 발생
    if (exists.length > 0) {
      const slots = exists
        .map((e) => `[${e.dayOfWeek} : ${e.hour}교시]`)
        .join(', ');
      throw new ConflictException(`${slots}에 이미 수강 신청을 하셨습니다.`);
    }

    // 정원 Check Transaction
    return this.prisma.$transaction(async (tx) => {
      // 내가 신청한 과목을 신청한 인원
      const enrolledCount = await tx.enrollment.count({
        where: { courseId: createEnrollmentDto.courseId },
      });

      // 정원이 다 찼는지 검사
      if (course.capacity <= enrolledCount) {
        throw new ConflictException(`이미 정원이 마감된 강의입니다.`);
      }

      // 다 통과하면 생성
      const enrollment = await tx.enrollment.create({
        data: {
          course: { connect: { id: createEnrollmentDto.courseId } },
          student: { connect: { id: userId } },
        },
        include: {
          course: { select: { title: true } },
        },
      });

      return enrollment;
    });
  }

  // 특정 신청 내역 조회 서비스
  async findOne(id: number) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
    });
    if (!enrollment) {
      throw new NotFoundException(`수강신청 기록을 찾을 수 없습니다.`);
    }

    return enrollment;
  }

  // 나의 신청 내역 조회 서비스
  async findMyEnrollments(userId: number) {
    return await this.prisma.enrollment.findMany({
      where: { studentId: userId },
      include: {
        course: {
          select: {
            title: true,
            professorId: true,
            courseType: true,
            capacity: true,
            timeTables: true,
          },
        },
      },
    });
  }

  // 강의별 신청 내역 조회 서비스
  async findByCourse(courseId: number, userId: number) {
    // 강의가 존재하는지 검사
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`${courseId} 강의를 찾을 수 없습니다.`);
    }

    // 본인 강의인지 검사
    if (course.professorId !== userId) {
      throw new ForbiddenException(`본인이 개설한 강의만 조회할 수 있습니다.`);
    }

    // 다 통과하면 실행
    return await this.prisma.enrollment.findMany({
      where: { courseId },
      include: {
        student: {
          select: {
            idNumber: true,
            user: { select: { name: true } },
          },
        },
      },
    });
  }

  // 신청 내역 삭제 서비스
  async remove(id: number, user: AuthUser) {
    // 신청 내역이 존재하는지 검사
    const enrollment = await this.findOne(id);

    // 내 신청내역이거나 관리자인지 검사
    if (enrollment.studentId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException(`삭제할 권한이 없는 신청내역입니다.`);
    }

    // 삭제 내역을 자세히 알 수 있도록 정보를 붙여서 반환
    const removed = await this.prisma.enrollment.delete({
      where: { id },
      include: {
        course: {
          select: {
            title: true,
            professorId: true,
            courseType: true,
            capacity: true,
            timeTables: true,
          },
        },
        student: {
          select: {
            idNumber: true,
            user: { select: { name: true } },
          },
        },
      },
    });

    return removed;
  }
}
