import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: '20260000' })
  @IsString()
  @IsNotEmpty()
  idNumber: string;

  @ApiProperty({ example: 'secret1234' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
