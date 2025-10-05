import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { PrometheusController } from '@willsoto/nestjs-prometheus';
import type { Response } from 'express';
import { AuthUncompleted, Public } from '../../common/decorators';
import { OnlyPrometheus } from './prometheus.guard';

@UseGuards(OnlyPrometheus)
@Controller()
export class AppPrometheusController extends PrometheusController {
   @Get()
   @Public()
   @AuthUncompleted()
   async index(@Res({ passthrough: true }) response: Response) {
      return super.index(response);
   }
}
