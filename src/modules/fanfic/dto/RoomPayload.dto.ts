import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { CommentableType } from '../../../common/constants';

export class RoomPayloadDTO {
   @IsString()
   @IsNotEmpty()
   @Matches(new RegExp(`^(${Object.values(CommentableType).join('|')})-\\d+$`), {
      message: "room must match pattern 'commentableType-id'"
   })
   room: string;
}
