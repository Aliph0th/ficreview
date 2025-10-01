import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { render } from '@react-email/components';
import VerifyEmail from './templates/verification.template';

@Injectable()
export class MailService {
   private readonly domain: string;
   constructor(
      private readonly mailerService: MailerService,
      private readonly configService: ConfigService
   ) {
      this.domain = this.configService.getOrThrow('FRONTEND_DOMAIN');
   }

   async sendEmailVerification(email: string, username: string, token: string) {
      const html = await render(VerifyEmail({ username, code: token, domain: this.domain }));
      return await this.sendEmail(email, 'Verification', html);
   }

   private async sendEmail(to: string, subject: string, html: string) {
      try {
         await this.mailerService.sendMail({
            to,
            subject,
            html
         });
         return true;
      } catch (_) {
         return false;
      }
   }
}
