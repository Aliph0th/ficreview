import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class WsJsonParsePipe implements PipeTransform {
   transform(value: unknown, _: ArgumentMetadata) {
      if (typeof value === 'string') {
         try {
            return JSON.parse(value);
         } catch {
            throw new BadRequestException('Invalid JSON');
         }
      }
      if (typeof value !== 'object' || value === null) {
         throw new BadRequestException('Invalid payload type');
      }
      return value;
   }
}
