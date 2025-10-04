import { IsEnum, IsInt, IsNumber, IsString, Length, Min } from 'class-validator';
import { CommentableType, VALIDATION_LENGTH } from '../../../common/constants';

export class CreateCommentDTO {
   @IsString()
   @Length(VALIDATION_LENGTH.COMMENT_MIN, VALIDATION_LENGTH.COMMENT_MAX)
   content: string;

   @IsNumber()
   @IsInt()
   @Min(1)
   commentableID: number;

   @IsString()
   @IsEnum(CommentableType)
   commentableType: CommentableType;
}
