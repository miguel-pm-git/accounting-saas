import { Module } from '@nestjs/common';
import { LedgerMovementsService } from './ledger-movements.service.js';
import { LedgerMovementsController } from './ledger-movements.controller.js';

@Module({
  providers: [LedgerMovementsService],
  controllers: [LedgerMovementsController]
})
export class LedgerMovementsModule {}
