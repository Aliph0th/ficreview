import {
   Body,
   ClassSerializerInterceptor,
   Controller,
   Get,
   Param,
   Post,
   Query,
   Req,
   UseInterceptors
} from '@nestjs/common';
import type { Request } from 'express';
import { CommentDTO, CreateCommentDTO, GetCommentsDTO } from '../dto';
import { CommentService } from './comment.service';
import { ID, PaginationDTO } from '../../../common/dto';
import { AuthUncompleted, Public } from '../../../common/decorators';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('comments')
export class CommentController {
   constructor(private readonly commentService: CommentService) {}

   @Post()
   async createComment(@Body() dto: CreateCommentDTO, @Req() request: Request) {
      return await this.commentService.createComment(dto, request.user!.id);
   }

   @Public()
   @AuthUncompleted()
   @Get(':id')
   async getCommentByID(@Param() { id }: ID) {
      const { comment, content } = await this.commentService.getCommentByIDOrThrow(id);
      return new CommentDTO(comment.get({ plain: true }), content);
   }

   @Public()
   @AuthUncompleted()
   @Get(':commentableID/:type')
   async getComments(@Param() params: GetCommentsDTO, @Query() query: PaginationDTO) {
      return this.commentService.getComments(params, query);
   }
}
