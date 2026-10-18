import { Module } from '@nestjs/common';
import { ChartAccountsService } from './chart-accounts.service.js';
import { ChartAccountsController } from './chart-accounts.controller.js';

@Module({
  controllers: [ChartAccountsController],
  providers: [ChartAccountsService],
})
export class ChartAccountsModule {}
