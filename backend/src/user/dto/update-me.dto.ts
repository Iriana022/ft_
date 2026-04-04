import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateMeDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    login?: string;

    @IsOptional()
    @IsEmail()
    @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
    email?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    firstName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    lastName?: string;
}