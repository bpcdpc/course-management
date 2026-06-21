import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';

@Module({
  providers: [StudentsService],
  controllers: [StudentsController],
  exports: [StudentsService], // UsersModule에서 사용하기 위해
})
export class StudentsModule {}
