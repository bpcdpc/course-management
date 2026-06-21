import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateEnrollmentDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  courseId: number;
}
