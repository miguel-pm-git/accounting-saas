import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import {
  invoice_status,
  subscription_status,
} from '../../generated/prisma/client.js';

import { PrismaService } from '../../prisma/prisma.service.js';
import { InvoicesService } from '../invoices/invoices.service.js';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly invoicesService: InvoicesService,
  ) {}

  @Cron('0 0 * * *')
  async processExpiredTrials() {
    const today = new Date();

    const subscriptions = await this.prisma.subscriptions.findMany({
      where: {
        status: subscription_status.TRIALING,
        trial_ends_at: {
          lte: today,
        },
      },
    });

    for (const subscription of subscriptions) {
      const existingInvoice = await this.prisma.invoices.findFirst({
        where: {
          subscription_id: subscription.id,
          status: {
            in: [invoice_status.PENDING, invoice_status.OVERDUE],
          },
        },
      });

      if (existingInvoice) {
        continue;
      }

      await this.invoicesService.generateInvoice(subscription.id);

      await this.prisma.subscriptions.update({
        where: {
          id: subscription.id,
        },
        data: {
          status: subscription_status.PAST_DUE,
        },
      });

      this.logger.log(`Trial expirado: ${subscription.id}`);
    }
  }

  @Cron('0 1 * * *')
  async processOverdueInvoices() {
    const today = new Date();

    const result = await this.prisma.invoices.updateMany({
      where: {
        status: invoice_status.PENDING,
        due_date: {
          lt: today,
        },
      },
      data: {
        status: invoice_status.OVERDUE,
      },
    });

    this.logger.log(`${result.count} invoices marcadas como OVERDUE`);
  }

  @Cron('0 2 * * *')
  async generateRenewalInvoices() {
    const today = new Date();

    const subscriptions = await this.prisma.subscriptions.findMany({
      where: {
        status: subscription_status.ACTIVE,
        current_period_end: {
          lte: today,
        },
      },
    });

    for (const subscription of subscriptions) {
      const existingInvoice = await this.prisma.invoices.findFirst({
        where: {
          subscription_id: subscription.id,
          status: {
            in: [invoice_status.PENDING, invoice_status.OVERDUE],
          },
        },
      });

      if (existingInvoice) {
        continue;
      }

      await this.invoicesService.generateInvoice(subscription.id);

      await this.prisma.subscriptions.update({
        where: {
          id: subscription.id,
        },
        data: {
          status: subscription_status.PAST_DUE,
        },
      });

      this.logger.log(`Renovação gerada: ${subscription.id}`);
    }
  }

  @Cron('0 3 * * *')
  async processDelinquentSubscriptions() {
    const limitDate = new Date();

    limitDate.setDate(limitDate.getDate() - 15);

    const overdueInvoices = await this.prisma.invoices.findMany({
      where: {
        status: invoice_status.OVERDUE,
        due_date: {
          lte: limitDate,
        },
      },
    });

    for (const invoice of overdueInvoices) {
      await this.prisma.subscriptions.update({
        where: {
          id: invoice.subscription_id,
        },
        data: {
          status: subscription_status.CANCELED,
          cancelled_at: new Date(),
        },
      });

      this.logger.warn(
        `Assinatura cancelada por inadimplência: ${invoice.subscription_id}`,
      );
    }
  }
}
