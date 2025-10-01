import {
   Body,
   ClassSerializerInterceptor,
   Controller,
   HttpCode,
   HttpStatus,
   Post,
   Req,
   Res,
   UseGuards,
   UseInterceptors
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { Public } from '../../common/decorators';
import { AuthService } from './auth.service';
import { RegisterUserDTO } from './dto';
import { UserDTO } from '../user/dto';
import { REFRESH_TOKEN_COOKIE_NAME, TOKEN_TTL } from '../../common/constants';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
   constructor(private readonly authService: AuthService) {}

   @Public()
   @Post('register')
   async register(@Body() dto: RegisterUserDTO) {
      const { user, isSentSuccessful } = await this.authService.register(dto);
      return { user: new UserDTO(user), isEmailSent: isSentSuccessful };
   }

   @UseGuards(AuthGuard('local'))
   @Public()
   @HttpCode(HttpStatus.OK)
   @Post('login')
   async login(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
      const { accessToken, refreshToken } = await this.authService.login(request.user!.id);
      response.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
         maxAge: TOKEN_TTL.REFRESH_TOKEN * 1000,
         httpOnly: true
      });
      return { accessToken };
   }
}
