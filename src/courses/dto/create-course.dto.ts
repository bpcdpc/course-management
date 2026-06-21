import { ApiProperty } from '@nestjs/swagger';
import { CourseType, SemesterType } from '@prisma/client';
import {
  ArrayNotEmpty,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { TimeTableDto } from './time-table.dto';
import { Type } from 'class-transformer';

export class CreateCourseDto {
  @ApiProperty({ example: '소프트웨어개발 방법론' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'MAJOR_ELECTIVE' })
  @IsEnum(CourseType, {
    message:
      'MAJOR_FOUNDATION | MAJOR_REQUIRED | MAJOR_ELECTIVE | GENERAL_REQUIRED | GENERAL_ELECTIVE | FREE_ELECTIVE | TEACHING_PROFESSION',
  })
  courseType: CourseType;

  // @ApiProperty({ example: 2026 })
  // @IsInt()
  // @Min(1970)
  // year: number;

  // @ApiProperty({ example: 'SECOND_SEMESTER' })
  // @IsEnum(SemesterType, {
  //   message:
  //     'FIRST_SEMESTER | SECOND_SEMESTER | SUMMER_SESSION | WINTER_SESSION',
  // })
  // semesterType: SemesterType;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  @Max(4)
  credits: number;

  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(3)
  capacity: number;

  @ApiProperty({
    example: [
      { dayOfWeek: 'MON', hour: 1 },
      { dayOfWeek: 'MON', hour: 2 },
      { dayOfWeek: 'MON', hour: 3 },
    ],
  })
  @ValidateNested({ each: true })
  @Type(() => TimeTableDto)
  @ArrayNotEmpty()
  timeTables: TimeTableDto[];
}
