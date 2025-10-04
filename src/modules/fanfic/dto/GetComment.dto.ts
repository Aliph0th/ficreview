import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsString, Min } from 'class-validator';
import { CommentableType } from '../../../common/constants';

export class GetCommentsDTO {
   @IsNumber()
   @IsInt()
   @Min(1)
   @Transform(({ value }) => +value)
   commentableID: number;

   @IsString()
   @IsEnum(CommentableType)
   type: CommentableType;
}
