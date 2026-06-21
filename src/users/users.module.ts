import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ProfessorsModule } from '../professors/professors.module';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [ProfessorsModule, StudentsModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
