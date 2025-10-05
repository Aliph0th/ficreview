import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { StorageModule } from '../storage/storage.module';
import { ChapterController } from './chapter/chapter.controller';
import { ChapterService } from './chapter/chapter.service';
import { CommentController } from './comment/comment.controller';
import { CommentService } from './comment/comment.service';
import { FanficController } from './fanfic/fanfic.controller';
import { FanficService } from './fanfic/fanfic.service';
import { Chapter } from './models/Chapter.model';
import { Comment } from './models/Comment.model';
import { Fanfic } from './models/Fanfic.model';
import { FanficLike } from './models/FanficLike.model';
import { CommentGateway } from './comment/comment.gateway';

@Module({
   imports: [SequelizeModule.forFeature([Fanfic, Chapter, Comment, FanficLike]), StorageModule],
   controllers: [FanficController, ChapterController, CommentController],
   providers: [FanficService, ChapterService, CommentService, CommentGateway]
})
export class FanficModule {}
