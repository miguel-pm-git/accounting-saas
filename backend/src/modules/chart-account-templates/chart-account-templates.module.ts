import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

import { ChartAccountTemplatesController } from './chart-account-templates.controller.js';
import { ChartAccountTemplatesService } from './chart-account-templates.service.js';

@Module({
  controllers: [ChartAccountTemplatesController],
  providers: [
    ChartAccountTemplatesService,
    PrismaService,
  ],
})
export class ChartAccountTemplatesModule {}