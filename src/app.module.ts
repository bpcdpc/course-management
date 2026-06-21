import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProfessorsModule } from './professors/professors.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [ProfessorsModule, PrismaModule, UsersModule, StudentsModule, AuthModule, CoursesModule, EnrollmentsModule],
})
export class AppModule {}
