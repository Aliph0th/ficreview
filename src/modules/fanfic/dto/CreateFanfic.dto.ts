import { ArrayMaxSize, IsArray, IsOptional, IsString, Length } from 'class-validator';
import { VALIDATION_LENGTH } from '../../../common/constants';

export class CreateFanficDTO {
   @IsString()
   @Length(VALIDATION_LENGTH.FANFIC_TITLE_MIN, VALIDATION_LENGTH.FANFIC_TITLE_MAX)
   title: string;

   @IsOptional()
   @IsString()
   @Length(1, VALIDATION_LENGTH.FANFIC_DESCRIPTION_MAX)
   description?: string;

   @IsOptional()
   @IsString()
   @Length(VALIDATION_LENGTH.FANDOM_MIN, VALIDATION_LENGTH.FANDOM_MAX)
   fandom?: string;

   @IsOptional()
   @IsArray()
   @ArrayMaxSize(VALIDATION_LENGTH.TAGS_PAIRINGS_MAX)
   @IsString({ each: true })
   @Length(1, VALIDATION_LENGTH.TAGS_PAIRINGS_MAX_LENGTH, { each: true })
   pairings?: string[];

   @IsOptional()
   @IsArray()
   @ArrayMaxSize(VALIDATION_LENGTH.TAGS_PAIRINGS_MAX)
   @IsString({ each: true })
   @Length(1, VALIDATION_LENGTH.TAGS_PAIRINGS_MAX_LENGTH, { each: true })
   tags?: string[];
}
