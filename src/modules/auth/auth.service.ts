import {
   BadRequestException,
   ConflictException,
   HttpException,
   HttpStatus,
   Injectable,
   NotFoundException
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import {
   EMAIL_VERIFY_RESEND_COOLDOWN,
   PASSWORD_SALT_ROUNDS,
   TOKEN_TTL,
   TokenType
} from '../../common/constants';
import { RedisService } from '../../core/redis/redis.service';
import { MailService } from '../mail/mail.service';
import { TokenService } from '../token/token.service';
import { UserService } from '../user/user.service';
import { RegisterUserDTO } from './dto';

@Injectable()
export class AuthService {
   constructor(
      private readonly userService: UserService,
      private readonly tokenService: TokenService,
      private readonly mailService: MailService,
      private readonly redisService: RedisService
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

   async verifyEmail(code: number, user: Express.User) {
      if (user.isEmailVerified) {
         throw new BadRequestException('Email is already verified');
      }
      const id = await this.tokenService.useToken(code, TokenType.EMAIL_VERIFICATION, user.id);
      await this.userService.setVerifiedEmail(id);
      return this.tokenService.signAuthTokens({ id: user.id, isEmailVerified: true });
   }

   async resendVerificationEmail(userID: number) {
      const user = await this.userService.findByID(userID);
      if (!user) {
         throw new NotFoundException('User not found');
      }
      if (user.isEmailVerified) {
         throw new BadRequestException('Email is already verified');
      }
      const cooldown = await this.redisService.getEmailVerificationCooldown(userID);
      if (cooldown > 0) {
         throw new HttpException(`Try again in ${cooldown} seconds`, HttpStatus.TOO_MANY_REQUESTS);
      }

      await this.tokenService.revokeTokens(userID, TokenType.EMAIL_VERIFICATION);
      const token = await this.tokenService.issueToken(
         userID,
         TokenType.EMAIL_VERIFICATION,
         TOKEN_TTL[TokenType.EMAIL_VERIFICATION]
      );

      await this.mailService.sendEmailVerification(user.email, user.username, token);
      await this.redisService.setEmailVerificationCooldown(userID, EMAIL_VERIFY_RESEND_COOLDOWN);

      return EMAIL_VERIFY_RESEND_COOLDOWN;
   }
}
