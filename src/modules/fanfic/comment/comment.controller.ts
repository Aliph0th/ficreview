import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthUncompleted, Public } from '../../../common/decorators';
import { ID, PaginationDTO } from '../../../common/dto';
import { CreateCommentDTO, GetCommentsDTO, UpdateCommentDTO } from '../dto';
import { CommentService } from './comment.service';

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
      return await this.commentService.getCommentByIDOrThrow(id);
   }

   @Public()
   @AuthUncompleted()
   @Get(':commentableID/:type')
   async getComments(@Param() params: GetCommentsDTO, @Query() query: PaginationDTO) {
      return this.commentService.getComments(params, query);
   }

   @Delete(':id')
   async deleteComment(@Param() { id }: ID, @Req() request: Request) {
      const deletedID = await this.commentService.deleteComment(id, request.user!.id);
      return { deleted: true, id: deletedID };
   }

   @Patch(':id')
   async updateComment(@Param() { id }: ID, @Body() dto: UpdateCommentDTO, @Req() request: Request) {
      return await this.commentService.updateCommentContent(id, request.user!.id, dto.content);
   }
}
