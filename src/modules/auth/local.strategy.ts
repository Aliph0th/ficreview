import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
   constructor(private readonly authService: AuthService) {
      super({ usernameField: 'login' });
   }

   async validate(username: string, password: string): Promise<{ id: number }> {
      const user = await this.authService.validateUser(username, password);
      if (!user) {
         throw new UnauthorizedException('Invalid email or password');
      }
      return { id: user.id };
   }
}
