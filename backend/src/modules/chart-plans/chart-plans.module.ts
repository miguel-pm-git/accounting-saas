import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module.js';

import { ChartPlansController } from './chart-plans.controller.js';
import { ChartPlansService } from './chart-plans.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [ChartPlansController],
  providers: [ChartPlansService],
  exports: [ChartPlansService],
})
export class ChartPlansModule {}