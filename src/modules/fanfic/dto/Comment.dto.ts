import { Exclude, Expose, Transform } from 'class-transformer';
import { CommentableType } from '../../../common/constants';
import { getCommentable } from '../../../common/utils';

export class CommentDTO {
   id: number;
   title: string;
   content: string;
   createdAt: Date;
   updatedAt: Date;

   @Expose()
   @Transform(({ obj }) => getCommentable(obj.commentableType, obj.fanfic ?? obj.chapter))
   commentable: object;

   @Exclude()
   contentPath: string;
   @Exclude()
   fanficID: number;
   @Exclude()
   authorID: number;
   @Exclude()
   commentableID: number;
   @Exclude()
   commentableType: CommentableType;
   @Exclude()
   fanfic: object;
   @Exclude()
   chapter: object;

   constructor(partial: Partial<CommentDTO>, content: string) {
      Object.assign(this, partial);
      this.content = content;
   }
}
