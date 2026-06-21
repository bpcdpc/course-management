import { ApiPropertyOptional } from '@nestjs/swagger';
import { CourseType, SemesterType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class FindCoursesDto {
  @ApiPropertyOptional({ example: '소프트웨어 공학' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ enum: CourseType })
  @IsOptional()
  @IsEnum(CourseType, {
    message:
      'MAJOR_FOUNDATION | MAJOR_REQUIRED | MAJOR_ELECTIVE | GENERAL_REQUIRED | GENERAL_ELECTIVE | FREE_ELECTIVE | TEACHING_PROFESSION',
  })
  courseType?: CourseType;

  @ApiPropertyOptional({ example: 2026 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @ApiPropertyOptional({ enum: SemesterType })
  @IsOptional()
  @IsEnum(SemesterType, {
    message:
      'FIRST_SEMESTER | SECOND_SEMESTER | SUMMER_SESSION | WINTER_SESSION',
  })
  semesterType?: SemesterType;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  professorId?: number;
}
