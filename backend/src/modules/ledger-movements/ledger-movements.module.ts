import { Module } from '@nestjs/common';
import { LedgerMovementsService } from './ledger-movements.service.js';
import { LedgerMovementsController } from './ledger-movements.controller.js';
import { TenantModule } from '../../common/tenant/tenant.module.js';

@Module({
  imports: [TenantModule],
  providers: [LedgerMovementsService],
  controllers: [LedgerMovementsController]
})
export class LedgerMovementsModule {}
