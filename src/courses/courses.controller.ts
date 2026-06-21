import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import {
  type AuthUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FindCoursesDto } from './dto/find-courses.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ActivatedGuard } from '../auth/guards/activated.guard';

@ApiTags('courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ActivatedGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @ApiOperation({ summary: '[교수] 강의 개설' })
  @UseGuards(RolesGuard)
  @Roles('PROFESSOR')
  @Post()
  create(
    @CurrentUser('id') userId: number,
    @Body() createCourseDto: CreateCourseDto,
  ) {
    return this.coursesService.create(userId, createCourseDto);
  }

  @ApiOperation({ summary: '[회원] 강의 목록 조회' })
  @Get()
  findAll(@Query() findCoursesDto: FindCoursesDto) {
    return this.coursesService.findAll(findCoursesDto);
  }

  @ApiOperation({ summary: '[회원] 특정 강의 조회' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.findOne(id);
  }

  @ApiOperation({ summary: '[교수] 강의 수정' })
  @UseGuards(RolesGuard)
  @Roles('PROFESSOR')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, userId, updateCourseDto);
  }

  @ApiOperation({ summary: '[교수|관리자] 강의 삭제' })
  // 관리자이거나 교수 본인의 강이일 때에만 삭제 가능 (서비스 로직에서 검사)
  @UseGuards(RolesGuard)
  @Roles('PROFESSOR', 'ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.coursesService.remove(id, user);
  }
}
