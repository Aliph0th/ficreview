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
import { AuthUncompleted, Public } from '../../common/decorators';
import { AuthService } from './auth.service';
import { EmailVerifyDTO, RegisterUserDTO } from './dto';
import { UserDTO } from '../user/dto';
import { REFRESH_TOKEN_COOKIE_NAME, TOKEN_TTL } from '../../common/constants';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
   constructor(private readonly authService: AuthService) {}

   @Public()
   @AuthUncompleted()
   @Post('register')
   async register(@Body() dto: RegisterUserDTO) {
      const { user, isSentSuccessful } = await this.authService.register(dto);
      return { user: new UserDTO(user), isEmailSent: isSentSuccessful };
   }

   @Public()
   @AuthUncompleted()
   @UseGuards(AuthGuard('local'))
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

   @Post('email/verify')
   @HttpCode(HttpStatus.OK)
   @AuthUncompleted()
   async verifyEmail(
      @Body() dto: EmailVerifyDTO,
      @Req() request: Request,
      @Res({ passthrough: true }) response: Response
   ) {
      const { accessToken, refreshToken } = await this.authService.verifyEmail(dto.code, request.user!);
      response.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
         maxAge: TOKEN_TTL.REFRESH_TOKEN * 1000,
         httpOnly: true
      });
      return { accessToken };
   }

   @Post('email/resend')
   @HttpCode(HttpStatus.OK)
   @AuthUncompleted()
   async resendEmail(@Req() request: Request) {
      const cooldown = await this.authService.resendVerificationEmail(request.user!.id);
      return { cooldown };
   }
}
