import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { StorageModule } from '../storage/storage.module';
import { ChapterController } from './chapter/chapter.controller';
import { ChapterService } from './chapter/chapter.service';
import { FanficController } from './fanfic/fanfic.controller';
import { FanficService } from './fanfic/fanfic.service';
import { Chapter } from './models/Chapter.model';
import { Comment } from './models/Comment.model';
import { Fanfic } from './models/Fanfic.model';
import { CommentController } from './comment/comment.controller';
import { CommentService } from './comment/comment.service';

@Module({
   imports: [SequelizeModule.forFeature([Fanfic, Chapter, Comment]), StorageModule],
   controllers: [FanficController, ChapterController, CommentController],
   providers: [FanficService, ChapterService, CommentService]
})
export class FanficModule {}
