import { NestFactory, Reflector } from '@nestjs/core';
import { CoreModule } from './core/core.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { loggerPrintF } from './common/utils';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { TokenService } from './modules/token/token.service';
import { ValidationPipe } from '@nestjs/common';
import { AuthGuard } from './common/guards';

const logger = WinstonModule.createLogger({
   transports: [
      new winston.transports.Console({
         format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.colorize({ all: true }),
            winston.format.printf(loggerPrintF)
         )
      })
   ]
});

async function bootstrap() {
   const app = await NestFactory.create(CoreModule, { logger });

   const configService = app.get(ConfigService);
   const tokenService = app.get(TokenService);
   const reflector = app.get(Reflector);

   app.use(helmet());
   app.enableCors({
      credentials: true,
      origin: configService.getOrThrow<string>('ALLOWED_ORIGIN')
   });

   app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, stopAtFirstError: true }));
   app.useGlobalGuards(new AuthGuard(tokenService, reflector));

   await app.listen(configService.get('PORT') ?? 3333);
}
void bootstrap();
