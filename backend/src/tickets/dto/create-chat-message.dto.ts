import { IsString, MinLength, IsBoolean, IsOptional } from 'class-validator';

export class CreateChatMessageDto {
  @IsString()
  @MinLength(1)
  content: string;

  @IsBoolean()
  @IsOptional()
  isFromSupport?: boolean;
}
