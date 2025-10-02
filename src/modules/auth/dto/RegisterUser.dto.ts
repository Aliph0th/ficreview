import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Match } from '../../../common/decorators';
import { VALIDATION_LENGTH } from '../../../common/constants';

export class RegisterUserDTO {
   @IsEmail()
   email: string;

   @IsString()
   @IsNotEmpty()
   @MinLength(VALIDATION_LENGTH.PASSWORD_MIN)
   password: string;

   @IsString()
   @IsNotEmpty()
   @MinLength(VALIDATION_LENGTH.PASSWORD_MIN)
   @Match('password')
   repeatedPassword: string;

   @IsString()
   @IsNotEmpty()
   @Transform(({ value }) => (typeof value === 'string' ? value?.trim() : value))
   @MinLength(VALIDATION_LENGTH.USERNAME_MIN)
   username: string;
}
