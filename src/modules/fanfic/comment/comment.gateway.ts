import {
   ConnectedSocket,
   MessageBody,
   OnGatewayConnection,
   OnGatewayDisconnect,
   SubscribeMessage,
   WebSocketGateway,
   WebSocketServer
} from '@nestjs/websockets';
import type { WsResponse } from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from '../../../common/constants';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { WsExceptionFilter } from '../../../common/filters';
import { WsJsonParsePipe } from '../../../common/pipes';
import { RoomPayloadDTO } from '../dto';

@WebSocketGateway({ cors: { origin: true, credentials: true } })
@UseFilters(WsExceptionFilter)
@UsePipes(new ValidationPipe({ whitelist: true, stopAtFirstError: true }))
export class CommentGateway implements OnGatewayConnection, OnGatewayDisconnect {
   @WebSocketServer()
   server: Server;

   handleConnection() {}

   handleDisconnect() {}

   @SubscribeMessage(SOCKET_EVENTS.JOIN_ROOM)
   async joinRoom(
      @ConnectedSocket() client: Socket,
      @MessageBody(WsJsonParsePipe) payload: RoomPayloadDTO
   ): Promise<WsResponse<unknown>> {
      await client.join(payload.room);
      return { event: SOCKET_EVENTS.JOINED, data: { room: payload.room } };
   }

   @SubscribeMessage(SOCKET_EVENTS.LEAVE_ROOM)
   async leaveRoom(
      @ConnectedSocket() client: Socket,
      @MessageBody(WsJsonParsePipe) payload: RoomPayloadDTO
   ): Promise<WsResponse<unknown>> {
      await client.leave(payload.room);
      return { event: SOCKET_EVENTS.LEFT, data: { room: payload.room } };
   }

   emitNewComment(room: string, comment: unknown) {
      this.server.to(room).emit(SOCKET_EVENTS.NEW_COMMENT, comment);
   }
}
