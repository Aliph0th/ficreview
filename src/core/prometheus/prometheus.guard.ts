import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class OnlyPrometheus implements CanActivate {
   constructor(private readonly configService: ConfigService) {}
   canActivate(context: ExecutionContext): boolean {
      if (
         this.configService.get('NODE_ENV') === 'development' &&
         this.configService.get('UNSECURE_METRICS')
      ) {
         return true;
      }
      const request = context.switchToHttp().getRequest<Request>();
      const [prefix, token] = request.headers.authorization?.split(' ') || [];
      const isTokenValid = this.configService.getOrThrow('PROMETHEUS_AUTH_TOKEN') === token;
      if (prefix?.toLowerCase() !== 'bearer' || !isTokenValid) {
         throw new ForbiddenException('Did you steal the fire from the gods?');
      }
      return true;
   }
}
