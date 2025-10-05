import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import * as dotenv from 'dotenv';
import { sequelizeConfig } from '../common/config';
import { UserModule } from '../modules/user/user.module';
import PrometheusMiddleware from 'express-prometheus-middleware';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { AuthModule } from '../modules/auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard, UncompletedAuthGuard } from '../common/guards';
import { FanficModule } from '../modules/fanfic/fanfic.module';
import { AppPrometheusController } from './prometheus/prometheus.controller';

dotenv.config();

@Module({
   imports: [
      ConfigModule.forRoot({
         cache: true,
         isGlobal: true,
         ignoreEnvFile: process.env.NODE_ENV === 'production'
      }),
      SequelizeModule.forRootAsync({
         inject: [ConfigService],
         useFactory: sequelizeConfig
      }),
      RedisModule,
      UserModule,
      AuthModule,
      FanficModule,
      PrometheusModule.register({
         global: true,
         controller: AppPrometheusController
      })
   ],
   providers: [
      { provide: APP_GUARD, useClass: JwtAuthGuard },
      { provide: APP_GUARD, useClass: UncompletedAuthGuard }
   ]
})
export class CoreModule implements NestModule {
   configure(consumer: MiddlewareConsumer) {
      consumer
         .apply(
            PrometheusMiddleware({
               collectDefaultMetrics: false,
               requestDurationBuckets: [0.05, 0.1, 0.5, 1, 1.5, 5]
            })
         )
         .forRoutes('*');
   }
}
