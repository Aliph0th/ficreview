import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthUncompleted, Public } from '../../../common/decorators';
import { ID } from '../../../common/dto';
import { CreateChapterDTO, UpdateChapterDTO } from '../dto';
import { ChapterService } from './chapter.service';

@Controller('chapters')
export class ChapterController {
   constructor(private readonly chapterService: ChapterService) {}

   @Post()
   async createChapter(@Body() dto: CreateChapterDTO) {
      return await this.chapterService.createChapter(dto);
   }

   @Public()
   @AuthUncompleted()
   @Get(':id')
   async getChapterByID(@Param() { id }: ID) {
      return await this.chapterService.getChapterByIDOrThrow(id);
   }

   @Delete(':id')
   async deleteChapter(@Param() { id }: ID, @Req() request: Request) {
      const deletedID = await this.chapterService.deleteChapter(id, request.user!.id);
      return { deleted: true, id: deletedID };
   }

   @Patch(':id')
   async updateChapter(@Param() { id }: ID, @Body() dto: UpdateChapterDTO, @Req() request: Request) {
      return await this.chapterService.updateChapterContent(id, request.user!.id, dto.content);
   }
}
