import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({ example: 'secret1234', description: '10글자 이상' })
  @IsString()
  @MinLength(10)
  newPassword: string;

  @ApiProperty({ example: '0000', description: '초기 비밀번호는 0000입니다.' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;
}
