import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FindUsersDto } from './dto/find-users.dto';
import { ActivatedGuard } from '../auth/guards/activated.guard';
import { UpdatePasswordDto } from './dto/update-password.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: '[관리자] 회원 등록' })
  @UseGuards(ActivatedGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({ summary: '[관리자] 회원 목록 조회 ' })
  @UseGuards(ActivatedGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll(@Query() findUsersDto: FindUsersDto) {
    return this.usersService.findAll(findUsersDto);
  }

  @ApiOperation({ summary: '[회원] 내 정보 조회' })
  @UseGuards(ActivatedGuard)
  @Get('me')
  findMe(@CurrentUser('id') userId: number) {
    return this.usersService.findOne(userId);
  }

  @ApiOperation({ summary: '[회원] 내 정보 수정' })
  @UseGuards(ActivatedGuard)
  @Patch('me')
  updateMe(
    @CurrentUser('id') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, updateUserDto);
  }

  // @ApiOperation({ summary: '[회원] 회원 탈퇴' })
  // @Delete('me')
  // remove(@CurrentUser('id') userId: number) {
  //   return this.usersService.remove(userId);
  // }

  @ApiOperation({ summary: '[회원] 비밀번호 변경' })
  @Patch('me/password')
  changePassword(
    @CurrentUser('id') userId: number,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.usersService.changePassword(userId, updatePasswordDto);
  }

  @ApiOperation({ summary: '[관리자] 특정 회원 조회' })
  @UseGuards(ActivatedGuard, RolesGuard)
  @Roles('ADMIN')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: '[관리자] 특정 회원 정보 수정' })
  @UseGuards(ActivatedGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  updateByAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiOperation({ summary: '[관리자] 특정 회원 강제 탈퇴' })
  @UseGuards(ActivatedGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  removeByAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
