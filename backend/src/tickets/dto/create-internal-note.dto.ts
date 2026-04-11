import { IsString, MinLength } from 'class-validator';

export class CreateInternalNoteDto {
    @IsString()
    @MinLength(1)
    content: string;
}