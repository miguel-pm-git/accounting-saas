import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller.js';
import { SubscriptionsService } from './subscriptions.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { InvoicesModule } from '../invoices/invoices.module.js';

@Module({
  imports: [
    PrismaModule,
    InvoicesModule,
  ],
  controllers: [SubscriptionsController],
  providers: [PrismaService, SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
