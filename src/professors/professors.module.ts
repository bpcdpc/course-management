import { Module } from '@nestjs/common';
import { ProfessorsService } from './professors.service';
import { ProfessorsController } from './professors.controller';

@Module({
  controllers: [ProfessorsController],
  providers: [ProfessorsService],
  exports: [ProfessorsService], // UsersModule에서 사용하기 위해
})
export class ProfessorsModule {}
