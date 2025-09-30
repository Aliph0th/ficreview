import {
   BadRequestException,
   CanActivate,
   ExecutionContext,
   ForbiddenException,
   Injectable
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { TokenService } from '../../modules/token/token.service';
import { METADATA } from '../constants';

@Injectable()
export class AuthGuard implements CanActivate {
   constructor(
      private readonly tokenService: TokenService,
      private readonly reflector: Reflector
   ) {}

   async canActivate(context: ExecutionContext): Promise<boolean> {
      const isPublic = this.reflector.get<boolean>(METADATA.PUBLIC, context.getHandler());
      if (isPublic) {
         return true;
      }
      const request = context.switchToHttp().getRequest<Request>();
      const [prefix, token] = request.headers.authorization?.split(' ') || [];
      if (prefix?.toLowerCase() !== 'bearer') {
         throw new BadRequestException('Invalid token prefix');
      }
      const data = this.tokenService.validateAccessToken<{ id: number }>(token);
      if (!data || !data.id) {
         throw new ForbiddenException('Invalid token');
      }
      // request.userID = data.id;
      return true;
   }
}
