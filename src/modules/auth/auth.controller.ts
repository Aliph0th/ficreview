import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { Public } from '../../common/decorators';

@Controller('auth')
export class AuthController {
   constructor(private readonly authService: AuthService) {}

   @UseGuards(AuthGuard('local'))
   @Public()
   @Post('login')
   async login(@Req() request: Request) {
      return this.authService.login(request.user!.id);
   }
}
