import { IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { Priority } from '@prisma/client';

export class CreateTicketDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;
}
