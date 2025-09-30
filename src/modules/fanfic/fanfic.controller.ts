import { Controller } from '@nestjs/common';
import { FanficService } from './fanfic.service';

@Controller('fanfics')
export class FanficController {
   constructor(private readonly fanficService: FanficService) {}
}
