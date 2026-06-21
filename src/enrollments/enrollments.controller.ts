import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import {
  type AuthUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @ApiOperation({ summary: '[학생] 수강 신청' })
  @UseGuards(RolesGuard)
  @Roles('STUDENT')
  @Post()
  create(
    @CurrentUser('id') userId: number,
    @Body() createEnrollmentDto: CreateEnrollmentDto,
  ) {
    return this.enrollmentsService.create(userId, createEnrollmentDto);
  }

  @ApiOperation({ summary: '[학생] 내 수강 신청 목록' })
  @Get('me')
  findMyEnrollments(@CurrentUser('id') userId: number) {
    return this.enrollmentsService.findMyEnrollments(userId);
  }

  @ApiOperation({ summary: '[교수] 특정 강의 수강생 목록' })
  @UseGuards(RolesGuard)
  @Roles('PROFESSOR')
  @Get('course/:courseId')
  findByCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.enrollmentsService.findByCourse(courseId, userId);
  }

  @ApiOperation({ summary: '[학생|관리자] 수강 신청 취소' })
  // 본인 신청내역이거나 관리자일 때에만 삭제 가능 (서비스 로직에서 검사)
  @UseGuards(RolesGuard)
  @Roles('STUDENT', 'ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.enrollmentsService.remove(id, user);
  }
}
