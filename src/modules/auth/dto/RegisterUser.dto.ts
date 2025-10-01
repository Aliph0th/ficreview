import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { MIN_PASSWORD_LENGTH, MIN_USERNAME_LENGTH } from '../../../common/constants';
import { Match } from '../../../common/decorators';

export class RegisterUserDTO {
   @IsEmail()
   email: string;

   @IsString()
   @IsNotEmpty()
   @MinLength(MIN_PASSWORD_LENGTH)
   password: string;

   @IsString()
   @IsNotEmpty()
   @MinLength(MIN_PASSWORD_LENGTH)
   @Match('password')
   repeatedPassword: string;

   @IsString()
   @IsNotEmpty()
   @Transform(({ value }) => (typeof value === 'string' ? value?.trim() : value))
   @MinLength(MIN_USERNAME_LENGTH)
   username: string;
}
