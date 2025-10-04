import { IsString, Length } from 'class-validator';
import { VALIDATION_LENGTH } from '../../../common/constants';

export class UpdateCommentDTO {
   @IsString()
   @Length(VALIDATION_LENGTH.COMMENT_MIN, VALIDATION_LENGTH.COMMENT_MAX)
   content!: string;
}
