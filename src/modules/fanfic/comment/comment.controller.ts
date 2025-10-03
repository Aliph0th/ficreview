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

@UseInterceptors(ClassSerializerInterceptor)
@Controller('comments')
export class CommentController {
   constructor(private readonly commentService: CommentService) {}

   @Post()
   async createComment(@Body() dto: CreateCommentDTO, @Req() request: Request) {
      const { comment, content } = await this.commentService.createComment(dto, request.user!.id);
      return new CommentDTO(comment.get({ plain: true }), content);
   }

   @Get(':id')
   async getCommentByID(@Param() { id }: ID) {
      const { comment, content } = await this.commentService.getCommentByIDOrThrow(id);
      return new CommentDTO(comment.get({ plain: true }), content);
   }

   @Get(':commentableID/:type')
   async getComments(@Param() params: GetCommentsDTO, @Query() query: PaginationDTO) {
      return this.commentService.getComments(params, query);
   }
}
