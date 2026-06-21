import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsPhoneNumber,
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class CreateUserDto {
  // @ApiProperty({ example: 'secret1234' })
  // @IsString()
  // @MinLength(10)
  // password: string;

  @ApiProperty({ example: '홍길동' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'user@univ.ac.kr' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '01012345678' })
  @IsPhoneNumber('KR')
  phone: string;

  @ApiProperty({ enum: Role, example: Role.STUDENT })
  @IsEnum(Role, { message: 'ADMIN | PROFESSOR | STUDENT' })
  role: Role;
}
