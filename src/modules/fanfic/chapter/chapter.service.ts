import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Chapter } from '../models/Chapter.model';
import { InjectModel } from '@nestjs/sequelize';
import { ChapterDTO, CreateChapterDTO } from '../dto';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { StorageService } from '../../storage/storage.service';
import { Fanfic } from '../models/Fanfic.model';
import { FanficService } from '../fanfic/fanfic.service';
import { PaginationDTO } from '../../../common/dto';
import { CacheService } from '../../../core/redis/cache.service';
import { CACHE_TTL, REDIS_KEYS } from '../../../common/constants';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class ChapterService {
   constructor(
      @InjectModel(Chapter) private chapterModel: typeof Chapter,
      private readonly storage: StorageService,
      private readonly fanficService: FanficService,
      private readonly configService: ConfigService,
      private readonly cache: CacheService
   ) {}

   async isChapterExists(id: number) {
      const chapter = await this.chapterModel.findByPk(id, { attributes: ['id'] });
      return !!chapter;
   }

   async createChapter(dto: CreateChapterDTO) {
      const fanficExists = await this.fanficService.isFanficExists(dto.fanficID);
      if (!fanficExists) {
         throw new NotFoundException('Fanfic not found');
      }
      const chapterID = randomUUID();
      await this.storage.put(
         Buffer.from(dto.content, 'utf-8'),
         {
            file: chapterID,
            folder: this.configService.getOrThrow<string>('S3_CHAPTERS_FOLDER'),
            ext: 'txt'
         },
         'private'
      );

      const chapter = await this.chapterModel.create({
         title: dto.title,
         contentPath: chapterID,
         fanficID: dto.fanficID
      });
      await this.cache.incrVersion(
         REDIS_KEYS.VER.chapter(chapter.id),
         REDIS_KEYS.VER.chaptersByFanfic(dto.fanficID)
      );
      return await this.getChapterByIDOrThrow(chapter.id);
   }

   async getChapterByIDOrThrow(id: number) {
      const ver = await this.cache.getVersion(REDIS_KEYS.VER.chapter(id));
      const key = REDIS_KEYS.CACHE.chapter(id, ver);
      return await this.cache.getOrSetJson(key, CACHE_TTL.chapter, async () => {
         const chapter = await this.chapterModel.findByPk(id, {
            include: { model: Fanfic, attributes: ['id', 'title', 'likes'] }
         });
         if (!chapter) {
            throw new NotFoundException('Chapter not found');
         }
         const content = await this.storage.get({
            file: chapter.contentPath,
            folder: this.configService.getOrThrow<string>('S3_CHAPTERS_FOLDER'),
            ext: 'txt'
         });
         const response = new ChapterDTO(chapter.get({ plain: true }), content.toString('utf-8'));
         return instanceToPlain(response);
      });
   }

   async getChapters(fanficID: number, { limit, page }: PaginationDTO) {
      const offset = (page - 1) * limit;
      const ver = await this.cache.getVersion(REDIS_KEYS.VER.chaptersByFanfic(fanficID));
      const key = REDIS_KEYS.CACHE.chaptersOverview(fanficID, page, limit, ver);
      return await this.cache.getOrSetJson(key, CACHE_TTL.chaptersOverview, async () => {
         const { count, rows: chapters } = await this.chapterModel.findAndCountAll({
            where: { fanficID },
            attributes: ['id', 'title', 'createdAt'],
            order: [['createdAt', 'DESC']],
            offset,
            limit
         });
         const totalPages = Math.max(1, Math.ceil(count / limit));
         return {
            data: chapters.map(chapter => chapter.get({ plain: true })),
            pagination: {
               currentPage: page,
               totalPages,
               totalItems: count,
               itemsPerPage: limit,
               hasNextPage: page < totalPages,
               hasPrevPage: page > 1
            }
         };
      });
   }

   async deleteChapter(id: number, userID: number) {
      const chapter = await this.getOwnChapter(id, userID);

      await this.storage.delete({
         file: chapter.contentPath,
         folder: this.configService.getOrThrow<string>('S3_CHAPTERS_FOLDER'),
         ext: 'txt'
      });

      await chapter.destroy();
      await this.cache.incrVersion(
         REDIS_KEYS.VER.chapter(id),
         REDIS_KEYS.VER.chaptersByFanfic(chapter.fanficID)
      );
      return id;
   }

   async updateChapterContent(id: number, userID: number, content: string) {
      const chapter = await this.getOwnChapter(id, userID);

      await this.storage.put(
         Buffer.from(content, 'utf-8'),
         {
            file: chapter.contentPath,
            folder: this.configService.getOrThrow<string>('S3_CHAPTERS_FOLDER'),
            ext: 'txt'
         },
         'private'
      );

      await this.cache.incrVersion(REDIS_KEYS.VER.chapter(id));
      return {
         url: new URL(
            `${this.configService.getOrThrow('S3_CHAPTERS_FOLDER')}/${chapter.contentPath}.webp`,
            this.configService.getOrThrow('S3_CDN')
         ).toString()
      };
   }

   private async getOwnChapter(id: number, userID: number) {
      const chapter = await this.chapterModel.findByPk(id, {
         include: [{ model: Fanfic, attributes: ['id', 'authorID'] }]
      });
      const plainChapter = chapter?.get({ plain: true });
      if (!plainChapter || !plainChapter.fanfic) {
         throw new NotFoundException('Chapter not found');
      }
      if (plainChapter.fanfic.authorID !== userID) {
         throw new ForbiddenException('You do not have permission to edit this chapter');
      }
      return chapter!;
   }
}
