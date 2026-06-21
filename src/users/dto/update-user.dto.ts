import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

// name, email, phone만 변경 가능
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['role'] as const),
) {}
