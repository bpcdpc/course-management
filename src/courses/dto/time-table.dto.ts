import { ApiProperty } from '@nestjs/swagger';
import { DayOfWeek } from '@prisma/client';
import { IsEnum, IsInt, Max, Min } from 'class-validator';

export class TimeTableDto {
  @ApiProperty({ example: 'FRI' })
  @IsEnum(DayOfWeek, { message: 'MON | TUE | WED | THU | FRI' })
  dayOfWeek: DayOfWeek;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(9)
  hour: number;
}
