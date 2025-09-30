import { Module } from '@nestjs/common';
import { FanficService } from './fanfic.service';
import { FanficController } from './fanfic.controller';

@Module({
   controllers: [FanficController],
   providers: [FanficService]
})
export class FanficModule {}
