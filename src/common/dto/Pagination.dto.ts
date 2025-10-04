import { Transform } from 'class-transformer';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { MAX_PAGINATION_LIMIT } from '../constants';

export class PaginationDTO {
   @IsOptional()
   @IsInt()
   @Min(1)
   @Transform(({ value }) => parseInt(value) || 1)
   page: number = 1;

   @IsOptional()
   @IsInt()
   @Min(1)
   @Max(MAX_PAGINATION_LIMIT)
   @Transform(({ value }) => parseInt(value) || 10)
   limit: number = 10;
}
