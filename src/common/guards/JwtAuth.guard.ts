import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { METADATA } from '../constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
   constructor(private readonly reflector: Reflector) {
      super();
   }

   canActivate(context: ExecutionContext) {
      const isPublic = this.reflector.getAllAndOverride<boolean>(METADATA.PUBLIC, [
         context.getHandler(),
         context.getClass()
      ]);
      if (isPublic) {
         return true;
      }
      return super.canActivate(context);
   }
}
