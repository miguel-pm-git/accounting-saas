import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module.js';
import { TenantModule } from '../../common/tenant/tenant.module.js';

import { ChartAccountsController } from './chart-accounts.controller.js';
import { ChartAccountsService } from './chart-accounts.service.js';

@Module({
  imports: [PrismaModule, TenantModule],
  controllers: [ChartAccountsController],
  providers: [ChartAccountsService],
  exports: [ChartAccountsService],
})
export class ChartAccountsModule {}
