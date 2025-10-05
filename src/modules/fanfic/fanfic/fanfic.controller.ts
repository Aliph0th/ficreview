import {
   Body,
   ClassSerializerInterceptor,
   Controller,
   Delete,
   Get,
   Param,
   Patch,
   Post,
   Query,
   Req,
   UploadedFile,
   UseInterceptors
} from '@nestjs/common';
import type { Request } from 'express';
import { ACCEPTABLE_FANFIC_TYPES, FANFIC_MAX_FILE_SIZE } from '../../../common/constants';
import { AuthUncompleted, FileInterceptor, Public } from '../../../common/decorators';
import { ID, PaginationDTO } from '../../../common/dto';
import { FileValidationPipe } from '../../../common/validators';
import { ChapterService } from '../chapter/chapter.service';
import { CreateFanficDTO, GetFanficsDTO } from '../dto';
import { FanficService } from './fanfic.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('fanfics')
export class FanficController {
   constructor(
      private readonly fanficService: FanficService,
      private readonly chapterService: ChapterService
   ) {}

   @FileInterceptor('file')
   @Post()
   async createFanfic(
      @Body() dto: CreateFanficDTO,
      @Req() request: Request,
      @UploadedFile(new FileValidationPipe(ACCEPTABLE_FANFIC_TYPES, FANFIC_MAX_FILE_SIZE, false))
      file?: Express.Multer.File
   ) {
      return await this.fanficService.createFanfic(dto, request.user!.id, file);
   }

   @Public()
   @AuthUncompleted()
   @Get(':id')
   async getFanficByID(@Param() { id }: ID) {
      return await this.fanficService.getFanficByIDOrThrow(id);
   }

   @Public()
   @AuthUncompleted()
   @Get(':id/overview')
   async getChapters(@Param() { id }: ID, @Query() pagination: PaginationDTO) {
      return await this.chapterService.getChapters(id, pagination);
   }

   @Public()
   @AuthUncompleted()
   @Get()
   async getFanfics(@Query() query: GetFanficsDTO) {
      return await this.fanficService.getFanfics(query);
   }

   @Delete(':id')
   async deleteFanfic(@Param() { id }: ID, @Req() request: Request) {
      const deletedID = await this.fanficService.deleteFanfic(id, request.user!.id);
      return { deleted: true, id: deletedID };
   }

   @FileInterceptor('file')
   @Patch(':id/cover')
   async updateCover(
      @Param() { id }: ID,
      @Req() request: Request,
      @UploadedFile(new FileValidationPipe(ACCEPTABLE_FANFIC_TYPES, FANFIC_MAX_FILE_SIZE, true))
      file: Express.Multer.File
   ) {
      return await this.fanficService.updateCover(id, request.user!.id, file);
   }

   @Patch(':id/like')
   async toggleLike(@Param() { id }: ID, @Req() request: Request) {
      return await this.fanficService.toggleLike(id, request.user!.id);
   }
}
