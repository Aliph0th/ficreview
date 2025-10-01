import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
   constructor(private readonly configService: ConfigService) {
      super({
         // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
         jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
         ignoreExpiration: false,
         secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
         issuer: configService.getOrThrow<string>('JWT_ISSUER')
      });
   }

   async validate(payload: { id: number }) {
      console.log(payload);
      return payload;
   }
}
