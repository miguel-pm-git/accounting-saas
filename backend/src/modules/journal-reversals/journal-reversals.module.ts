import { Module } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';

import { JournalReversalsController } from './journal-reversals.controller.js';
import { JournalReversalsService } from './journal-reversals.service.js';

import { TenantModule } from '../../common/tenant/tenant.module.js';
import { LedgerMovementsService } from '../ledger-movements/ledger-movements.service.js';
@Module({
  imports: [TenantModule],
  controllers: [JournalReversalsController],
  providers: [JournalReversalsService, PrismaService, LedgerMovementsService],
})
export class JournalReversalsModule {}
