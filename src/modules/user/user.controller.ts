import {
   ClassSerializerInterceptor,
   Controller,
   Get,
   Patch,
   Req,
   UploadedFile,
   UseInterceptors
} from '@nestjs/common';
import type { Request } from 'express';
import { ACCEPTABLE_AVATAR_TYPES, AVATAR_MAX_FILE_SIZE } from '../../common/constants';
import { AuthUncompleted, FileInterceptor } from '../../common/decorators';
import { FileValidationPipe } from '../../common/validators';
import { UserDTO } from './dto';
import { UserService } from './user.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UserController {
   constructor(private readonly userService: UserService) {}

   @Get('me')
   @AuthUncompleted()
   async getMe(@Req() req: Request) {
      const user = await this.userService.findByIDOrThrow(req.user!.id);
      return new UserDTO(user.get({ plain: true }));
   }

   @Patch('avatar')
   @FileInterceptor('file')
   async changeAvatar(
      @UploadedFile(new FileValidationPipe(ACCEPTABLE_AVATAR_TYPES, AVATAR_MAX_FILE_SIZE))
      file: Express.Multer.File,
      @Req() req: Request
   ) {
      return await this.userService.changeAvatar(file.buffer, req.user!.id);
   }
}
