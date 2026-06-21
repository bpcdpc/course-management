import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PrismaService } from '../prisma/prisma.service';
import { FindCoursesDto } from './dto/find-courses.dto';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { getCurrentYearAndSemester } from '../common/utils/get-current-semester';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  // 강의 개설 서비스
  async create(userId: number, createCourseDto: CreateCourseDto) {
    // 현재 년도와 학기 설정
    const { currentYear, currentSemester } = getCurrentYearAndSemester();

    // 타임 테이블 검색
    // 1) 요일/시간 중에 겹치는 것이 있는지 OR 로 찾기
    // 2) 현재 로그인한 교수가 현재년도에 현재 학기에 등록하는 것인지 필터링
    const exists = await this.prisma.timeTable.findMany({
      where: {
        OR: createCourseDto.timeTables.map((t) => ({
          dayOfWeek: t.dayOfWeek,
          hour: t.hour,
        })),
        course: {
          professorId: userId,
          year: currentYear,
          semesterType: currentSemester,
        },
      },
    });

    // 있으면 에러 발생
    if (exists.length > 0) {
      const slots = exists
        .map((e) => `[${e.dayOfWeek} : ${e.hour}교시]`)
        .join(', ');
      throw new ConflictException(`${slots}에 이미 수업을 개설하셨습니다.`);
    }

    // 없으면 1) course 생성 2) time table 생성
    // 중첩되어서 테이블의 row를 생성하면 prisma에서 알아서 atomic한 동작을 보장해 줌
    // 따라서 transaction 쓸 필요 없음.
    const course = await this.prisma.course.create({
      data: {
        title: createCourseDto.title,
        courseType: createCourseDto.courseType,
        year: currentYear,
        semesterType: currentSemester,
        credits: createCourseDto.credits,
        capacity: createCourseDto.capacity,
        professor: { connect: { id: userId } },
        timeTables: {
          create: createCourseDto.timeTables,
        },
      },
      include: { timeTables: { select: { dayOfWeek: true, hour: true } } },
    });

    return course;
  }

  // 강의 목록 조회 서비스
  async findAll(findCoursesDto: FindCoursesDto) {
    const { title, courseType, year, semesterType, professorId } =
      findCoursesDto;

    const courses = await this.prisma.course.findMany({
      where: {
        title: title ? { contains: title } : undefined,
        courseType: courseType || undefined,
        year: year || undefined,
        semesterType: semesterType || undefined,
        professorId: professorId || undefined,
      },
      orderBy: { id: 'desc' },
      include: { timeTables: { select: { dayOfWeek: true, hour: true } } },
    });
    return courses;
  }

  // 강의 단건 조회 서비스
  async findOne(id: number) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { timeTables: { select: { dayOfWeek: true, hour: true } } },
    });

    if (!course) {
      throw new NotFoundException(`${id}번 강의를 찾을 수 없습니다.`);
    }

    return course;
  }

  // 강의 수정 서비스
  async update(id: number, userId: number, updateCourseDto: UpdateCourseDto) {
    // 존재하는 강의인지 검사
    const course = await this.findOne(id);

    // 내 강의가 아닌지 검사
    if (course.professorId !== userId) {
      throw new ForbiddenException(`수정할 권한이 없는 강의입니다.`);
    }

    // 수강생이 없는지 검사
    const students = await this.prisma.enrollment.findFirst({
      where: { courseId: id },
    });

    if (students) {
      throw new ConflictException(
        `현재 수강하고 있는 학생이 있어, 강의 내용을 변경할 수 없습니다.`,
      );
    }

    // 개설한 교수, 년도, 학기, 요일, 시간 중복 검사
    // 타임 테이블 검색
    // 1) 요일/시간 중에 겹치는 것이 있는지 OR 로 찾기
    // 2) 현재 로그인한 교수가 현재년도에 현재 학기에 등록하는 것인지 필터링
    if (updateCourseDto.timeTables !== undefined) {
      const exists = await this.prisma.timeTable.findMany({
        where: {
          OR: updateCourseDto.timeTables.map((t) => ({
            dayOfWeek: t.dayOfWeek,
            hour: t.hour,
          })),
          course: {
            professorId: userId,
            year: course.year,
            semesterType: course.semesterType,
          },
        },
      });

      const conflicts = exists.filter((e) => e.courseId !== id);
      if (conflicts.length > 0) {
        const slots = conflicts
          .map((e) => `[${e.dayOfWeek} : ${e.hour}교시]`)
          .join(', ');
        throw new ConflictException(`${slots}에 이미 수업을 개설하셨습니다.`);
      }
    }

    // 다 통과하면 업데이트
    const { timeTables, ...rest } = updateCourseDto;

    const updated = await this.prisma.course.update({
      where: { id },
      data: {
        ...rest,
        ...(timeTables && {
          timeTables: {
            deleteMany: {},
            create: timeTables,
          },
        }),
      },
      include: { timeTables: { select: { dayOfWeek: true, hour: true } } },
    });

    return updated;
  }

  // 강의 삭제 서비스
  async remove(id: number, user: AuthUser) {
    // 존재하는 강의인지 검사
    const course = await this.findOne(id);

    // 내 강의이거나 관리자인지 검사
    if (course.professorId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException(`삭제할 권한이 없는 강의입니다.`);
    }

    // 수강생이 없는지 검사
    const students = await this.prisma.enrollment.findFirst({
      where: { courseId: id },
    });

    if (students) {
      throw new ConflictException(
        `현재 수강하고 있는 학생이 있어, 강의를 삭제할 수 없습니다.`,
      );
    }

    // 다 통과하면 삭제
    const removed = await this.prisma.course.delete({
      where: { id },
      include: { timeTables: { select: { dayOfWeek: true, hour: true } } },
    });

    return removed;
  }
}
