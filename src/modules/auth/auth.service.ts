import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';
import { TokenService } from '../token/token.service';
import { RegisterUserDTO } from './dto';
import { PASSWORD_SALT_ROUNDS, TOKEN_TTL, TokenType } from '../../common/constants';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
   constructor(
      private readonly userService: UserService,
      private readonly tokenService: TokenService,
      private readonly mailService: MailService
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

   async register({ email, username, password }: RegisterUserDTO) {
      const candidate = await this.userService.findByEmail(email);

      if (candidate) {
         throw new ConflictException('User with such email already exists');
      }
      const hashedPassword = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
      const user = await this.userService.create({ email, username, password: hashedPassword });
      const token = await this.tokenService.issueToken(
         user.id,
         TokenType.EMAIL_VERIFICATION,
         TOKEN_TTL[TokenType.EMAIL_VERIFICATION]
      );
      const isSentSuccessful = await this.mailService.sendEmailVerification(user.email, user.username, token);
      return { user: user.get({ plain: true }), isSentSuccessful };
   }

   async login(userID: number) {
      return this.tokenService.signAuthTokens({ id: userID });
   }
}
