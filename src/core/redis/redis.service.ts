import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_KEYS, TokenType } from '../../common/constants';

@Injectable()
export class RedisService extends Redis {
   constructor(private readonly configService: ConfigService) {
      const url = `redis://${configService.get('REDIS_USER') || ''}:${configService.get('REDIS_PASSWORD') || ''}@${configService.getOrThrow('REDIS_HOST')}:${configService.getOrThrow('REDIS_PORT')}/${configService.getOrThrow('REDIS_DATABASE')}`;
      super(url);
   }

   async saveToken(type: TokenType, token: string, userID: number, ttl: number) {
      await this.set(REDIS_KEYS.TOKEN(type, token), userID.toString(), 'EX', ttl);
   }
}
