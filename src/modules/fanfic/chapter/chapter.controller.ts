import {
   Body,
   ClassSerializerInterceptor,
   Controller,
   Patch,
   Delete,
   Get,
   Param,
   Post,
   Req,
   UseInterceptors
} from '@nestjs/common';
import type { Request } from 'express';
import { ChapterService } from './chapter.service';
import { Public, AuthUncompleted } from '../../../common/decorators';
import { ID } from '../../../common/dto';
import { ChapterDTO, CreateChapterDTO, UpdateChapterDTO } from '../dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('chapters')
export class ChapterController {
   constructor(private readonly chapterService: ChapterService) {}

   @Post()
   async createChapter(@Body() dto: CreateChapterDTO) {
      const { chapter, content } = await this.chapterService.createChapter(dto);
      return new ChapterDTO(chapter.get({ plain: true }), content);
   }

   @Public()
   @AuthUncompleted()
   @Get(':id')
   async getChapterByID(@Param() { id }: ID) {
      const { chapter, content } = await this.chapterService.getChapterByIDOrThrow(id);
      return new ChapterDTO(chapter.get({ plain: true }), content);
   }

   @Delete(':id')
   async deleteChapter(@Param() { id }: ID, @Req() request: Request) {
      const deletedID = await this.chapterService.deleteChapter(id, request.user!.id);
      return { deleted: true, id: deletedID };
   }

   @Patch(':id')
   async updateChapter(@Param() { id }: ID, @Body() dto: UpdateChapterDTO, @Req() request: Request) {
      const { chapter, content } = await this.chapterService.updateChapterContent(
         id,
         request.user!.id,
         dto.content
      );
      return new ChapterDTO(chapter.get({ plain: true }), content);
   }
}
