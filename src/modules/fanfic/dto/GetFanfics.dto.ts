import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { MAX_PAGINATION_LIMIT } from '../../../common/constants';

export class GetFanficsDTO {
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

   @IsOptional()
   @IsIn(['new', 'popular'])
   sort: 'new' | 'popular' = 'new';
}
