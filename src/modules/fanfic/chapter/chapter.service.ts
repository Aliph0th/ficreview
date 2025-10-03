import { Injectable, NotFoundException } from '@nestjs/common';
import { Chapter } from '../models/Chapter.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateChapterDTO } from '../dto';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { StorageService } from '../../storage/storage.service';
import { Fanfic } from '../models/Fanfic.model';
import { FanficService } from '../fanfic/fanfic.service';

@Injectable()
export class ChapterService {
   constructor(
      @InjectModel(Chapter) private chapterModel: typeof Chapter,
      private readonly storage: StorageService,
      private readonly fanficService: FanficService,
      private readonly configService: ConfigService
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

      return await this.getChapterByIDOrThrow(chapter.id);
   }

   async getChapterByIDOrThrow(id: number) {
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
      return { chapter, content: content.toString('utf-8') };
   }
}
