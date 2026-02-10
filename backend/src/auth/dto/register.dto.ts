import { IsString, MinLength, Matches, IsEmail } from 'class-validator';

export class RegisterDto {
  @IsString()
  login: string;

  @IsEmail({}, { message: 'Email invalide' }) 
  email: string;

  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit faire au moins 8 caractères.' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Le mot de passe est trop faible (doit contenir 1 majuscule, 1 minuscule et 1 chiffre/symbole).',
  })
  password: string;
}