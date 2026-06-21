import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AdminLoginDto } from './dto/admin-login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '[Public] 로그인 (학번/직번)' })
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: '[Public] 관리자 로그인 (이메일)' })
  @Post('login/admin')
  loginAdmin(@Body() adminLoginDto: AdminLoginDto) {
    return this.authService.loginAdmin(adminLoginDto);
  }
}
