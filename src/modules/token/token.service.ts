import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sign, verify, JwtPayload, SignOptions } from 'jsonwebtoken';
import { EMAIL_VERIFICATION_TOKEN_LENGTH, TOKEN_TTL, TokenType } from '../../common/constants';
import { RedisService } from '../../core/redis/redis.service';
import { randomUUID, randomInt } from 'crypto';

@Injectable()
export class TokenService {
   constructor(
      private readonly configService: ConfigService,
      private readonly redisService: RedisService
   ) {}

   signAuthTokens(payload: Record<string, unknown>) {
      const accessTokenSecret = this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
      const refreshTokenSecret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');

      const accessToken = this.sign(payload, accessTokenSecret, TOKEN_TTL.ACCESS_TOKEN);
      const refreshToken = this.sign(payload, refreshTokenSecret, TOKEN_TTL.REFRESH_TOKEN);
      return { accessToken, refreshToken };
   }

   validateAccessToken<T extends JwtPayload | string = JwtPayload>(token: string) {
      return this.verify<T>(token, this.configService.getOrThrow('JWT_ACCESS_SECRET'));
   }
   validateRefreshToken<T extends JwtPayload | string = JwtPayload>(token: string) {
      return this.verify<T>(token, this.configService.getOrThrow('JWT_REFRESH_SECRET'));
   }

   async issueToken(userID: number, type: TokenType, ttl: number) {
      const token = this.generateToken(type);
      await this.redisService.saveToken(type, token, userID, ttl);
      return token;
   }

   private sign(payload: Record<string, unknown>, secret: string, expiresIn?: SignOptions['expiresIn']) {
      return sign(payload, secret, {
         expiresIn,
         notBefore: 0,
         issuer: this.configService.getOrThrow('JWT_ISSUER')
      });
   }

   private verify<T extends JwtPayload | string = JwtPayload>(token: string, secret: string): T | null {
      try {
         return verify(token, secret, {
            issuer: this.configService.getOrThrow('JWT_ISSUER')
         }) as T;
      } catch (_) {
         return null;
      }
   }

   private generateToken(type: TokenType) {
      switch (type) {
         case TokenType.EMAIL_VERIFICATION: {
            const n = EMAIL_VERIFICATION_TOKEN_LENGTH;
            return randomInt(10 ** (n - 1), 10 ** n).toString();
         }
         case TokenType.PASSWORD_RESET:
            return randomUUID();
      }
   }
}
