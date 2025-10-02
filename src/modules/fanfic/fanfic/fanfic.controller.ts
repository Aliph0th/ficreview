import {
   Controller,
   Post,
   Req,
   Body,
   UploadedFile,
   ClassSerializerInterceptor,
   UseInterceptors,
   Get,
   Param
} from '@nestjs/common';
import type { Request } from 'express';
import { CreateFanficDTO, FanficDTO } from '../dto';
import { AuthUncompleted, FileInterceptor, Public } from '../../../common/decorators';
import { FileValidationPipe } from '../../../common/validators';
import { ACCEPTABLE_FANFIC_TYPES, FANFIC_MAX_FILE_SIZE } from '../../../common/constants';
import { ID } from '../../../common/dto';
import { FanficService } from './fanfic.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('fanfics')
export class FanficController {
   constructor(private readonly fanficService: FanficService) {}

   @FileInterceptor('file')
   @Post()
   async createFanfic(
      @Body() dto: CreateFanficDTO,
      @Req() request: Request,
      @UploadedFile(new FileValidationPipe(ACCEPTABLE_FANFIC_TYPES, FANFIC_MAX_FILE_SIZE, false))
      file?: Express.Multer.File
   ) {
      const fanfic = await this.fanficService.createFanfic(dto, request.user!.id, file);
      return new FanficDTO(fanfic.get({ plain: true }));
   }

   @Public()
   @AuthUncompleted()
   @Get(':id')
   async getFanficByID(@Param() { id }: ID) {
      const fanfic = await this.fanficService.getFanficByIDOrThrow(id);
      return new FanficDTO(fanfic.get({ plain: true }));
   }
}
