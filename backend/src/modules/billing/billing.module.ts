import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module.js';
import { InvoicesModule } from '../invoices/invoices.module.js';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module.js';

import { BillingService } from './billing.service.js';

@Module({
  imports: [PrismaModule, InvoicesModule, SubscriptionsModule],
  providers: [BillingService],
})
export class BillingModule {}
