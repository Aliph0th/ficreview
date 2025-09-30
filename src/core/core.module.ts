import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { sequelizeConfig } from './config';

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
      })
   ]
})
export class CoreModule {}
