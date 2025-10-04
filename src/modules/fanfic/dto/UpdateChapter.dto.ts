import { IsString, Length } from 'class-validator';
import { VALIDATION_LENGTH } from '../../../common/constants';

export class UpdateChapterDTO {
   @IsString()
   @Length(1, VALIDATION_LENGTH.CHAPTER_CONTENT_MAX)
   content!: string;
}
