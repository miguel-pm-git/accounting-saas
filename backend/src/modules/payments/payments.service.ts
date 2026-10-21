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

import { PaymentGatewayFactory } from './gateways/payment-gateway.factory.js';
import { payment_gateway } from '../../generated/prisma/client.js';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
    private readonly gatewayFactory: PaymentGatewayFactory,
    private readonly configService: ConfigService,
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

  async createCharge(invoiceId: bigint) {
    const invoice = await this.prisma.invoices.findUnique({
      where: {
        id: invoiceId,
      },
      include: {
        subscriptions: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Fatura não encontrada');
    }

    const existingPayment = await this.prisma.payments.findFirst({
      where: {
        invoice_id: invoiceId,
        status: {
          in: [payment_status.PENDING, payment_status.PAID],
        },
      },
    });

    if (existingPayment) {
      throw new BadRequestException('Já existe um pagamento para esta fatura');
    }

    const provider =
      this.configService.get<payment_gateway>('PAYMENT_GATEWAY') ??
      payment_gateway.ASAAS;

    const gateway = this.gatewayFactory.getGateway(provider);

    const company = await this.prisma.companies.findUnique({
      where: {
        id: invoice.company_id,
      },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    if (!company.asaas_customer_id) {
      throw new BadRequestException(
        'Empresa não possui cliente Asaas vinculado',
      );
    }

    const response = await gateway.createCharge({
      invoiceId,
      amount: Number(invoice.amount),
      customerId: company.asaas_customer_id,
      description: `Invoice ${invoice.invoice_number}`,
    });

    const [updatedInvoice, payment] = await this.prisma.$transaction([
      this.prisma.invoices.update({
        where: {
          id: invoiceId,
        },
        data: {
          external_invoice_id: response.externalId,

          gateway_reference: response.paymentUrl ?? response.pixQrCode ?? null,
        },
      }),

      this.prisma.payments.create({
        data: {
          company_id: invoice.company_id,
          invoice_id: invoice.id,
          gateway: provider,
          amount: invoice.amount,
          status: payment_status.PENDING,
          transaction_id: response.externalId,
          gateway_response: response.rawResponse,
        },
      }),
    ]);

    return {
      invoice: updatedInvoice,
      payment,

      gateway: {
        externalId: response.externalId,

        paymentUrl: response.paymentUrl,

        pixQrCode: response.pixQrCode,
      },
    };
  }
}
