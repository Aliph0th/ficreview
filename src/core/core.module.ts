import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import * as dotenv from 'dotenv';
import { sequelizeConfig } from '../common/config';
import { UserModule } from '../modules/user/user.module';
import { AuthModule } from '../modules/auth/auth.module';
import { RedisModule } from './redis/redis.module';

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
      AuthModule
   ]
})
export class CoreModule {}
