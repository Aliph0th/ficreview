import { IsNumber, IsString, Length, Min } from 'class-validator';
import { VALIDATION_LENGTH } from '../../../common/constants';

export class CreateChapterDTO {
   @IsString()
   @Length(1, VALIDATION_LENGTH.CHAPTER_MAX)
   title: string;

   @IsNumber()
   @Min(1)
   fanficID: number;

   @IsString()
   @Length(1, VALIDATION_LENGTH.CHAPTER_CONTENT_MAX)
   content: string;
}
