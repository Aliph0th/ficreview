import { Exclude } from 'class-transformer';

export class ChapterDTO {
   id: number;
   title: string;
   content: string;
   createdAt: Date;
   updatedAt: Date;
   fanfic: { id: number; title: string; likes: number };

   @Exclude()
   contentPath: string;
   @Exclude()
   fanficID: number;

   constructor(partial: Partial<ChapterDTO>, content: string) {
      Object.assign(this, partial);
      this.content = content;
   }
}
