import {
   Body,
   ClassSerializerInterceptor,
   Controller,
   Get,
   Param,
   Post,
   UseInterceptors
} from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { Public, AuthUncompleted } from '../../../common/decorators';
import { ID } from '../../../common/dto';
import { ChapterDTO, CreateChapterDTO } from '../dto';

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
}
