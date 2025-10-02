import { Module } from '@nestjs/common';
import { FanficService } from './fanfic.service';
import { FanficController } from './fanfic.controller';
import { UserModule } from '../user/user.module';
import { StorageModule } from '../storage/storage.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Fanfic } from './models/Fanfic.model';
import { Chapter } from './models/Chapter.model';
import { Comment } from './models/Comment.model';

@Module({
   imports: [SequelizeModule.forFeature([Fanfic, Chapter, Comment]), UserModule, StorageModule],
   controllers: [FanficController],
   providers: [FanficService]
})
export class FanficModule {}
