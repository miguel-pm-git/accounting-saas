import { Module } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';

import { JournalEntriesController } from './journal-entries.controller.js';
import { JournalEntriesService } from './journal-entries.service.js';
import { LedgerMovementsService } from '../ledger-movements/ledger-movements.service.js';
import { TenantModule } from '../../common/tenant/tenant.module.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
@Module({
  imports: [
    PrismaModule,
    TenantModule,
  ],
  controllers: [
    JournalEntriesController,
  ],
  providers: [
    JournalEntriesService,
    PrismaService,
    LedgerMovementsService,
  ],
})
export class JournalEntriesModule {}