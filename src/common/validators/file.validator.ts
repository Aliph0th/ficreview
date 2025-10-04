import { ArgumentMetadata, Injectable, PipeTransform, UnprocessableEntityException } from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
   constructor(
      private readonly mimes: string[],
      private readonly maxSize: number,
      private readonly isRequired = true
   ) {}
   transform(value: Express.Multer.File, _: ArgumentMetadata) {
      if (!value && this.isRequired) {
         throw new UnprocessableEntityException('File is required');
      }
      if (value && !this.mimes.includes(value.mimetype)) {
         throw new UnprocessableEntityException('Invalid file type');
      }
      if (value && value.size > this.maxSize) {
         throw new UnprocessableEntityException('File is too big');
      }
      return value;
   }
}
