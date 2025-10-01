import { ConfigService } from '@nestjs/config';
import { SequelizeModuleOptions } from '@nestjs/sequelize';
import path from 'path';

export const sequelizeConfig = (config: ConfigService): SequelizeModuleOptions => {
   const isDevelopment = config.get('NODE_ENV') === 'development';
   return {
      dialect: 'postgres',
      host: config.getOrThrow<string>('POSTGRES_HOST'),
      port: config.getOrThrow<number>('POSTGRES_PORT'),
      username: config.getOrThrow<string>('POSTGRES_USER'),
      password: config.getOrThrow<string>('POSTGRES_PASSWORD'),
      database: config.getOrThrow<string>('POSTGRES_DATABASE'),
      models: [path.join(__dirname, '..', '..', 'modules', '**', 'models', '*.model.{ts,js}')],
      autoLoadModels: isDevelopment,
      synchronize: isDevelopment,
      modelMatch: (filename, member) => {
         const modelName = filename.substring(0, filename.indexOf('.model')).toLowerCase();
         return modelName === member.toLowerCase();
      }
   };
};
