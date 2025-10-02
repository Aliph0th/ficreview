import {
   ClassSerializerInterceptor,
   Controller,
   Get,
   NotFoundException,
   Patch,
   Req,
   UploadedFile,
   UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { AuthUncompleted } from '../../common/decorators';
import { UserDTO } from './dto';
import { UserService } from './user.service';
import { FileValidationPipe } from './validators';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UserController {
   constructor(private readonly userService: UserService) {}

   @Get('me')
   @AuthUncompleted()
   async getMe(@Req() req: Request) {
      const user = await this.userService.findByID(req.user!.id);
      if (!user) {
         throw new NotFoundException('User not found');
      }
      return new UserDTO(user.get({ plain: true }));
   }

   @Patch('avatar')
   @UseInterceptors(FileInterceptor('file'))
   async changeAvatar(
      @UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
      @Req() req: Request
   ) {
      return await this.userService.changeAvatar(file.buffer, req.user!.id);
   }
}
