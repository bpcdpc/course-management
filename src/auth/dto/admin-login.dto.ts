import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@univ.ac.kr' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'admin1234' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
