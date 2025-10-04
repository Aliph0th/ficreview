import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';
import { loggerPrintF } from './common/utils';
import { CoreModule } from './core/core.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

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

   app.use(helmet());
   app.enableCors({
      credentials: true,
      origin: configService.getOrThrow<string>('ALLOWED_ORIGIN')
   });

   app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, stopAtFirstError: true }));
   app.useWebSocketAdapter(new IoAdapter(app));

   await app.listen(configService.get('PORT') ?? 3333);
}
void bootstrap();
