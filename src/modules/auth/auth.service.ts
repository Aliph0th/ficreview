import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';
import { TokenService } from '../token/token.service';

@Injectable()
export class AuthService {
   constructor(
      private readonly userService: UserService,
      private readonly tokenService: TokenService
   ) {}

   async validateUser(email: string, pass: string) {
      const user = await this.userService.findByEmail(email);
      if (!user) {
         return null;
      }
      const isPasswordValid = await bcrypt.compare(pass, user.password);
      if (!isPasswordValid) {
         return null;
      }
      return user;
   }

   async login(userID: number) {
      return this.tokenService.signAuthTokens({ id: userID });
   }
}
