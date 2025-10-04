import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Socket } from 'socket.io';

@Catch()
export class WsExceptionFilter implements ExceptionFilter {
   catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToWs();
      const client = ctx.getClient<Socket>();
      const message = this.getMessage(exception);
      client.emit('wsError', { message });
   }

   private getMessage(exception: unknown): string {
      if (exception instanceof HttpException) {
         const res = exception.getResponse();
         if (typeof res === 'string') return res;
         if (typeof res === 'object' && res && 'message' in res) {
            const msg = res.message;
            if (Array.isArray(msg)) return msg.join('; ');
            if (typeof msg === 'string') return msg;
         }
         return exception.message;
      }
      if (exception instanceof Error) return exception.message;
      return 'Unknown error';
   }
}
