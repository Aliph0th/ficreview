import { Exclude, Expose, Transform } from 'class-transformer';
import { Role } from '../../../common/constants';
import { getAvatarUrl } from '../../../common/utils';

export class UserDTO {
   id: number;
   email: string;
   username: string;
   @Expose()
   @Transform(({ obj }) => obj.avatar || getAvatarUrl(obj.avatarPath))
   avatar?: string;
   isEmailVerified: boolean;
   role: Role;

   createdAt: Date;
   updatedAt: Date;

   @Exclude()
   password: string;
   @Exclude()
   avatarPath: string;

   constructor(partial: Partial<UserDTO>) {
      Object.assign(this, partial);
   }
}
