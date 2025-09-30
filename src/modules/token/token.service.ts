import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sign, verify, JwtPayload, SignOptions } from 'jsonwebtoken';

@Injectable()
export class TokenService {
   constructor(private readonly configService: ConfigService) {}

   signAuthTokens(payload: Record<string, unknown>) {
      const accessTokenSecret = this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
      const accessTokenTTL = this.configService.getOrThrow<SignOptions['expiresIn']>('JWT_ACCESS_TTL');

      const refreshTokenSecret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
      const refreshTokenTTL = this.configService.getOrThrow<SignOptions['expiresIn']>('JWT_REFRESH_TTL');

      const accessToken = this.sign(payload, accessTokenSecret, accessTokenTTL);
      const refreshToken = this.sign(payload, refreshTokenSecret, refreshTokenTTL);
      return { accessToken, refreshToken };
   }

   validateAccessToken<T extends JwtPayload | string = JwtPayload>(token: string) {
      return this.verify<T>(token, this.configService.getOrThrow('JWT_ACCESS_SECRET'));
   }
   validateRefreshToken<T extends JwtPayload | string = JwtPayload>(token: string) {
      return this.verify<T>(token, this.configService.getOrThrow('JWT_REFRESH_SECRET'));
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
}
