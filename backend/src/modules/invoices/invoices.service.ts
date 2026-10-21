import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';
import { TenantContext } from '../../common/tenant/tenant.context.js';

import {
  invoice_status,
  subscription_status,
} from '../../generated/prisma/client.js';
import { serializeBigInt } from '../../common/utils/bigint.util.js';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  async findAll(companyId: bigint) {
    const invoices = await this.prisma.invoices.findMany({
      where: {
        company_id: companyId,
      },
      include: {
        subscriptions: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return serializeBigInt(invoices);
  }

  async findOne(id: bigint) {
    const companyId = this.tenantContext.getCompanyId();

    const invoice = await this.prisma.invoices.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice não encontrada');
    }

    return serializeBigInt(invoice);
  }

  async markAsPaid(id: bigint, reference?: string) {
    const companyId = this.tenantContext.getCompanyId();

    const invoice = await this.prisma.invoices.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice não encontrada');
    }

    if (invoice.status === invoice_status.PAID) {
      throw new BadRequestException('Fatura já foi processada');
    }

    const invoicePaid = await this.prisma.invoices.update({
      where: {
        id,
      },
      data: {
        status: invoice_status.PAID,
        paid_at: new Date(),
        gateway_reference: reference,
      },
    });

    const subscription = await this.prisma.subscriptions.update({
      where: {
        id: invoice.subscription_id,
      },
      data: {
        status: subscription_status.ACTIVE,
      },
    });

    await this.prisma.subscription_history.create({
      data: {
        subscription_id: subscription.id,
        old_plan_id: subscription.plan_id,
        new_plan_id: subscription.plan_id,
        notes: 'Pagamento confirmado',
      },
    });

    return serializeBigInt(invoicePaid);
  }

  async generateInvoice(subscriptionId: bigint) {
    const subscription = await this.prisma.subscriptions.findUnique({
      where: {
        id: subscriptionId,
      },
      include: {
        plans: true,
      },
    });

    if (!subscription) {
      throw new Error('Subscription não encontrada');
    }

    const invoiceNumber = `INV-${Date.now()}`;

    return this.prisma.invoices.create({
      data: {
        company_id: subscription.company_id,
        subscription_id: subscription.id,

        invoice_number: invoiceNumber,

        issue_date: new Date(),

        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),

        amount: subscription.plans.price,

        status: invoice_status.PENDING,
      },
    });
  }

  async findOverdue(companyId: bigint) {
    return this.prisma.invoices.findMany({
      where: {
        company_id: companyId,
        due_date: {
          lt: new Date(),
        },
        status: invoice_status.PENDING,
      },
      include: {
        subscriptions: true,
        companies: true,
      },
    });
  }

  async findBySubscription(subscriptionId: bigint) {
    return this.prisma.invoices.findMany({
      where: {
        subscription_id: subscriptionId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }
}
