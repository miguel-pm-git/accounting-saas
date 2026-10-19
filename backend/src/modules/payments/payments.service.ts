import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  invoice_status,
  payment_status,
  subscription_status,
} from '../../generated/prisma/client.js';

import { PrismaService } from '../../prisma/prisma.service.js';
import { TenantContext } from '../../common/tenant/tenant.context.js';

import { CreatePaymentDto } from './dto/create-payment.dto.js';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  async create(dto: CreatePaymentDto) {
    const companyId = this.tenantContext.getCompanyId();

    const invoice = await this.prisma.invoices.findFirst({
      where: {
        id: BigInt(dto.invoice_id),
        company_id: companyId,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Fatura não encontrada');
    }

    return this.prisma.payments.create({
      data: {
        company_id: companyId,
        invoice_id: invoice.id,

        gateway: dto.gateway,

        amount: dto.amount,

        status: payment_status.PENDING,

        transaction_id: dto.transaction_id,
      },
    });
  }
  async confirmPayment(paymentId: bigint, transactionId?: string) {
    const payment = await this.prisma.payments.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        invoices: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    if (payment.status === payment_status.PAID) {
      throw new BadRequestException('Pagamento já confirmado');
    }

    if (payment.invoices.status === invoice_status.PAID) {
      throw new BadRequestException('Fatura já paga');
    }

    await this.prisma.$transaction([
      this.prisma.payments.update({
        where: {
          id: paymentId,
        },
        data: {
          paid_at: new Date(),
          status: payment_status.PAID,
          transaction_id: transactionId ?? payment.transaction_id,
        },
      }),

      this.prisma.invoices.update({
        where: {
          id: payment.invoice_id,
        },
        data: {
          status: invoice_status.PAID,
          paid_at: new Date(),
        },
      }),

      this.prisma.subscriptions.update({
        where: {
          id: payment.invoices.subscription_id,
        },
        data: {
          status: subscription_status.ACTIVE,
        },
      }),
    ]);

    return {
      success: true,
    };
  }

  async findAll() {
    const companyId = this.tenantContext.getCompanyId();

    return this.prisma.payments.findMany({
      where: {
        company_id: companyId,
      },
      include: {
        invoices: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: bigint) {
    const companyId = this.tenantContext.getCompanyId();

    const payment = await this.prisma.payments.findFirst({
      where: {
        id,
        company_id: companyId,
      },
      include: {
        invoices: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    return payment;
  }
}
