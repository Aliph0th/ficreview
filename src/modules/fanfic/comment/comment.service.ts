import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { randomUUID } from 'crypto';
import { Includeable } from 'sequelize';
import { CommentableType } from '../../../common/constants';
import { PaginationDTO } from '../../../common/dto';
import { StorageService } from '../../storage/storage.service';
import { User } from '../../user/models/User.model';
import { ChapterService } from '../chapter/chapter.service';
import { CommentDTO, CreateCommentDTO, GetCommentsDTO } from '../dto';
import { FanficService } from '../fanfic/fanfic.service';
import { Chapter } from '../models/Chapter.model';
import { Comment } from '../models/Comment.model';
import { Fanfic } from '../models/Fanfic.model';
import { CommentGateway } from './comment.gateway';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class CommentService {
   constructor(
      @InjectModel(Comment) private commentModel: typeof Comment,
      private readonly storage: StorageService,
      private readonly fanficService: FanficService,
      private readonly chapterService: ChapterService,
      private readonly commentGateway: CommentGateway,
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
      const created = await this.commentModel.create({
         contentPath: commentID,
         commentableID: dto.commentableID,
         commentableType: dto.commentableType,
         authorID: userID
      });
      const { comment, content } = await this.getCommentByIDOrThrow(created.id, dto.commentableType);
      const commentDto = new CommentDTO(comment.get({ plain: true }), content);
      const room = `${dto.commentableType}-${dto.commentableID}`;
      this.commentGateway.emitNewComment(room, instanceToPlain(commentDto));
      return commentDto;
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

   async deleteComment(id: number, userID: number) {
      const comment = await this.getOwnComment(id, userID);

      await this.storage.delete({
         file: comment.contentPath,
         folder: this.configService.getOrThrow<string>('S3_COMMENTS_FOLDER'),
         ext: 'txt'
      });

      await comment.destroy();
      return id;
   }

   async updateCommentContent(id: number, userID: number, content: string) {
      const comment = await this.getOwnComment(id, userID);

      await this.storage.put(
         Buffer.from(content, 'utf-8'),
         {
            file: comment.contentPath,
            folder: this.configService.getOrThrow<string>('S3_COMMENTS_FOLDER'),
            ext: 'txt'
         },
         'private'
      );

      const updatedComment = await this.getCommentByIDOrThrow(id);
      return updatedComment;
   }

   private async getOwnComment(id: number, userID: number) {
      const comment = await this.commentModel.findByPk(id);
      if (!comment) {
         throw new NotFoundException('Comment not found');
      }
      if (comment.authorID !== userID) {
         throw new ForbiddenException('You do not have permission to edit this comment');
      }
      return comment;
   }

   private resolveIncludes(type?: CommentableType) {
      const includes: Includeable[] = [{ model: User, attributes: ['id', 'username', 'role'], as: 'author' }];
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
