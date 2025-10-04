import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { METADATA } from '../constants';
import type { Request } from 'express';

@Injectable()
export class UncompletedAuthGuard implements CanActivate {
   constructor(private readonly reflector: Reflector) {}

   canActivate(context: ExecutionContext) {
      const allowUncompletedAuth = this.reflector.getAllAndOverride<boolean>(METADATA.UNCOMPLETED_AUTH, [
         context.getHandler(),
         context.getClass()
      ]);
      if (allowUncompletedAuth) {
         return true;
      }

      const request = context.switchToHttp().getRequest<Request>();
      if (!request?.user?.isEmailVerified) {
         throw new UnauthorizedException('You must verify email first');
      }

      return true;
   }
}
