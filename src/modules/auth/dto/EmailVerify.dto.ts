import { IsNumber } from 'class-validator';
import { EMAIL_VERIFICATION_TOKEN_LENGTH } from '../../../common/constants';
import { NumberLength } from '../../../common/decorators';

export class EmailVerifyDTO {
   @IsNumber()
   @NumberLength(EMAIL_VERIFICATION_TOKEN_LENGTH)
   code: number;
}
