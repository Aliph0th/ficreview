import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { TokenModule } from '../token/token.module';
import { MailModule } from '../mail/mail.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
   imports: [UserModule, TokenModule, PassportModule, MailModule],
   controllers: [AuthController],
   providers: [AuthService, LocalStrategy, JwtStrategy]
})
export class AuthModule {}
