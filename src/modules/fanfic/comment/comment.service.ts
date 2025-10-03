import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CommentDTO, CreateCommentDTO, GetCommentsDTO } from '../dto';
import { ConfigService } from '@nestjs/config';
import { StorageService } from '../../storage/storage.service';
import { ChapterService } from '../chapter/chapter.service';
import { FanficService } from '../fanfic/fanfic.service';
import { CommentableType } from '../../../common/constants';
import { randomUUID } from 'crypto';
import { Comment } from '../models/Comment.model';
import { User } from '../../user/models/User.model';
import { Fanfic } from '../models/Fanfic.model';
import { Chapter } from '../models/Chapter.model';
import { PaginationDTO } from '../../../common/dto';
import { Includeable } from 'sequelize';

@Injectable()
export class CommentService {
   constructor(
      @InjectModel(Comment) private commentModel: typeof Comment,
      private readonly storage: StorageService,
      private readonly fanficService: FanficService,
      private readonly chapterService: ChapterService,
      private readonly configService: ConfigService
   ) {}

   async createComment(dto: CreateCommentDTO, userID: number) {
      const isExists = await this.checkExistence(dto.commentableID, dto.commentableType);
      if (!isExists) {
         throw new NotFoundException('Commentable entity not found');
      }
      const commentID = randomUUID();
      await this.storage.put(
         Buffer.from(dto.content, 'utf-8'),
         {
            file: commentID,
            folder: this.configService.getOrThrow<string>('S3_COMMENTS_FOLDER'),
            ext: 'txt'
         },
         'private'
      );
      const comment = await this.commentModel.create({
         contentPath: commentID,
         commentableID: dto.commentableID,
         commentableType: dto.commentableType,
         authorID: userID
      });
      return await this.getCommentByIDOrThrow(comment.id, dto.commentableType);
   }

   async getCommentByIDOrThrow(id: number, type?: CommentableType) {
      const comment = await this.commentModel.findByPk(id, {
         include: this.resolveIncludes(type) //TODO: infer type (?)
      });
      if (!comment) {
         throw new NotFoundException('Comment not found');
      }
      const content = await this.storage.get({
         file: comment.contentPath,
         folder: this.configService.getOrThrow<string>('S3_COMMENTS_FOLDER'),
         ext: 'txt'
      });
      return { comment, content: content.toString('utf-8') };
   }

   async getComments({ commentableID, type }: GetCommentsDTO, { page, limit }: PaginationDTO) {
      const isExists = await this.checkExistence(commentableID, type);
      if (!isExists) {
         throw new NotFoundException('Commentable entity not found');
      }

      const offset = (page - 1) * limit;

      const { count, rows: comments } = await this.commentModel.findAndCountAll({
         where: {
            commentableID,
            commentableType: type
         },
         include: this.resolveIncludes(type), //TODO: map objects (exclude commentable)
         order: [['createdAt', 'DESC']],
         offset,
         limit
      });

      const commentsWithContent = await Promise.all(
         comments.map(async comment => {
            const content = await this.storage.get({
               file: comment.contentPath,
               folder: this.configService.getOrThrow<string>('S3_COMMENTS_FOLDER'),
               ext: 'txt'
            });
            return new CommentDTO(comment.get({ plain: true }), content.toString('utf-8'));
         })
      );

      const totalPages = Math.ceil(count / limit);

      return {
         data: commentsWithContent,
         pagination: {
            currentPage: page,
            totalPages,
            totalItems: count,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
         }
      };
   }

   private resolveIncludes(type?: CommentableType) {
      const includes: Includeable[] = [{ model: User, attributes: ['id', 'username', 'role'], as: 'author' }];
      console.log(type);
      switch (type) {
         case CommentableType.FANFIC:
            includes.push({
               model: Fanfic,
               required: false,
               as: 'fanfic',
               attributes: ['id', 'title', 'likes']
            });
            break;
         case CommentableType.CHAPTER:
            includes.push({
               model: Chapter,
               required: false,
               as: 'chapter',
               attributes: ['id', 'title']
            });
            break;
      }

      return includes;
   }

   private async checkExistence(commentableID: number, commentableType: CommentableType) {
      switch (commentableType) {
         case CommentableType.FANFIC:
            return this.fanficService.isFanficExists(commentableID);
         case CommentableType.CHAPTER:
            return this.chapterService.isChapterExists(commentableID);
         default:
            return false;
      }
   }
}
