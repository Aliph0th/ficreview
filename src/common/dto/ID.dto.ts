import { Transform } from 'class-transformer';
import { IsInt, IsNumber, Min } from 'class-validator';

export class ID {
   @IsNumber()
   @IsInt()
   @Min(1)
   @Transform(({ value }) => +value)
   id: number;
}
