import { Exclude, Expose, Transform } from 'class-transformer';
import { getCoverUrl } from '../../../common/utils';
import { Role } from '../../../common/constants';

export class FanficDTO {
   id: number;
   title: string;
   description: string | null;
   likes: number;
   fandom: string | null;
   createdAt: Date;
   updatedAt: Date;
   author: {
      id: number;
      username: string;
      role: Role;
   };

   @Expose()
   @Transform(({ obj }) => obj.cover || getCoverUrl(obj.coverPath))
   cover: string | null;
   @Transform(({ value }) => (Array.isArray(value) ? value : []))
   pairings: string[];
   @Transform(({ value }) => (Array.isArray(value) ? value : []))
   tags: string[];

   @Exclude()
   coverPath: string | null;
   @Exclude()
   authorID: number;

   constructor(partial: Partial<FanficDTO>) {
      Object.assign(this, partial);
   }
}
