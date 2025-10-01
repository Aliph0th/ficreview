import {
   Body,
   ClassSerializerInterceptor,
   Controller,
   Post,
   Req,
   UseGuards,
   UseInterceptors
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { Public } from '../../common/decorators';
import { AuthService } from './auth.service';
import { RegisterUserDTO } from './dto';
import { UserDTO } from '../user/dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
   constructor(private readonly authService: AuthService) {}

   @Post('register')
   @Public()
   async register(@Body() dto: RegisterUserDTO) {
      const { user, isSentSuccessful } = await this.authService.register(dto);
      return { user: new UserDTO(user), isEmailSent: isSentSuccessful };
   }

   @UseGuards(AuthGuard('local'))
   @Public()
   @Post('login')
   async login(@Req() request: Request) {
      return this.authService.login(request.user!.id);
   }
}
