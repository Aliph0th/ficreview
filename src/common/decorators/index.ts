import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor as interceptor } from '@nestjs/platform-express';

export * from './auth.decorators';
export * from './match.decorator';
export * from './numberLength.decorator';

export const FileInterceptor = (field: string) => applyDecorators(UseInterceptors(interceptor(field)));
