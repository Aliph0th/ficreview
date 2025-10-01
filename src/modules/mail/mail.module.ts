import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { getMailerConfig } from '../../common/config';

@Module({
   imports: [
      MailerModule.forRootAsync({
         inject: [ConfigService],
         useFactory: getMailerConfig
      })
   ],
   providers: [MailService],
   exports: [MailService]
})
export class MailModule {}
