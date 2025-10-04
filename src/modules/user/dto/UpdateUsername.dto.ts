import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { VALIDATION_LENGTH } from '../../../common/constants';

export class UpdateUsernameDTO {
   @IsString()
   @IsNotEmpty()
   @Transform(({ value }) => (typeof value === 'string' ? value?.trim() : value))
   @MinLength(VALIDATION_LENGTH.USERNAME_MIN)
   username: string;
}
