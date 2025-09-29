import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
   imports: [
      ConfigModule.forRoot({
         cache: true,
         isGlobal: true,
         ignoreEnvFile: process.env.NODE_ENV === 'production'
      })
   ]
})
export class CoreModule {}
