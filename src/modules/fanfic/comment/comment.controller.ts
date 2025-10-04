import {
   Body,
   ClassSerializerInterceptor,
   Controller,
   Patch,
   Delete,
   Get,
   Param,
   Post,
   Query,
   Req,
   UseInterceptors
} from '@nestjs/common';
import type { Request } from 'express';
import { CommentDTO, CreateCommentDTO, GetCommentsDTO, UpdateCommentDTO } from '../dto';
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

   @Delete(':id')
   async deleteComment(@Param() { id }: ID, @Req() request: Request) {
      const deletedID = await this.commentService.deleteComment(id, request.user!.id);
      return { deleted: true, id: deletedID };
   }

   @Patch(':id')
   async updateComment(@Param() { id }: ID, @Body() dto: UpdateCommentDTO, @Req() request: Request) {
      const updated = await this.commentService.updateCommentContent(id, request.user!.id, dto.content);
      return new CommentDTO(updated.comment.get({ plain: true }), updated.content);
   }
}
