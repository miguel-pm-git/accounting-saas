import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

import { ChartAccountTemplatesController } from './chart-account-templates.controller.js';
import { ChartAccountTemplatesService } from './chart-account-templates.service.js';

import { TenantModule } from '../../common/tenant/tenant.module.js';
@Module({
  imports: [TenantModule],
  controllers: [ChartAccountTemplatesController],
  providers: [ChartAccountTemplatesService],
})
export class ChartAccountTemplatesModule {}