import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';

import {
  invoice_status,
  payment_status,
  subscription_status,
} from '../../generated/prisma/client.js';

import { PaymentsService } from './payments.service.js';

describe('PaymentsService', () => {
  let service: PaymentsService;

  const prismaMock = {
    payments: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },

    invoices: {
      update: vi.fn(),
    },

    subscriptions: {
      update: vi.fn(),
    },

    $transaction: vi.fn(),
  };

  const tenantContextMock = {
    getCompanyId: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    service = new PaymentsService(prismaMock as any, tenantContextMock as any);
  });

  describe('confirmPayment', () => {
    it('deve confirmar o pagamento com sucesso', async () => {
      prismaMock.payments.findUnique.mockResolvedValue({
        id: 1n,
        invoice_id: 10n,
        transaction_id: 'TX123',
        invoices: {
          subscription_id: 100n,
        },
      });

      prismaMock.payments.update.mockResolvedValue({});
      prismaMock.invoices.update.mockResolvedValue({});
      prismaMock.subscriptions.update.mockResolvedValue({});

      prismaMock.$transaction.mockResolvedValue([]);

      const result = await service.confirmPayment(1n, 'NEW_TX');

      expect(prismaMock.payments.findUnique).toHaveBeenCalledWith({
        where: {
          id: 1n,
        },
        include: {
          invoices: true,
        },
      });

      expect(prismaMock.$transaction).toHaveBeenCalledOnce();

      expect(result).toEqual({
        success: true,
      });
    });

    it('deve lançar NotFoundException quando o pagamento não existir', async () => {
      prismaMock.payments.findUnique.mockResolvedValue(null);

      await expect(service.confirmPayment(999n)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve utilizar o transaction_id informado', async () => {
      prismaMock.payments.findUnique.mockResolvedValue({
        id: 1n,
        invoice_id: 10n,
        transaction_id: 'OLD_TX',
        invoices: {
          subscription_id: 100n,
        },
      });

      prismaMock.payments.update.mockResolvedValue({});
      prismaMock.invoices.update.mockResolvedValue({});
      prismaMock.subscriptions.update.mockResolvedValue({});

      prismaMock.$transaction.mockResolvedValue([]);

      await service.confirmPayment(1n, 'NEW_TX');

      expect(prismaMock.payments.update).toHaveBeenCalledWith({
        where: {
          id: 1n,
        },
        data: {
          paid_at: expect.any(Date),
          status: payment_status.PAID,
          transaction_id: 'NEW_TX',
        },
      });
    });

    it('deve utilizar o transaction_id existente quando não informado', async () => {
      prismaMock.payments.findUnique.mockResolvedValue({
        id: 1n,
        invoice_id: 10n,
        transaction_id: 'EXISTING_TX',
        invoices: {
          subscription_id: 100n,
        },
      });

      prismaMock.payments.update.mockResolvedValue({});
      prismaMock.invoices.update.mockResolvedValue({});
      prismaMock.subscriptions.update.mockResolvedValue({});

      prismaMock.$transaction.mockResolvedValue([]);

      await service.confirmPayment(1n);

      expect(prismaMock.payments.update).toHaveBeenCalledWith({
        where: {
          id: 1n,
        },
        data: {
          paid_at: expect.any(Date),
          status: payment_status.PAID,
          transaction_id: 'EXISTING_TX',
        },
      });
    });

    it('deve atualizar payment, invoice e subscription', async () => {
      prismaMock.payments.findUnique.mockResolvedValue({
        id: 1n,
        invoice_id: 10n,
        transaction_id: 'TX123',
        invoices: {
          subscription_id: 100n,
        },
      });

      prismaMock.payments.update.mockResolvedValue({});
      prismaMock.invoices.update.mockResolvedValue({});
      prismaMock.subscriptions.update.mockResolvedValue({});

      prismaMock.$transaction.mockResolvedValue([]);

      await service.confirmPayment(1n, 'TX999');

      expect(prismaMock.payments.update).toHaveBeenCalledWith({
        where: {
          id: 1n,
        },
        data: {
          paid_at: expect.any(Date),
          status: payment_status.PAID,
          transaction_id: 'TX999',
        },
      });

      expect(prismaMock.invoices.update).toHaveBeenCalledWith({
        where: {
          id: 10n,
        },
        data: {
          status: invoice_status.PAID,
          paid_at: expect.any(Date),
        },
      });

      expect(prismaMock.subscriptions.update).toHaveBeenCalledWith({
        where: {
          id: 100n,
        },
        data: {
          status: subscription_status.ACTIVE,
        },
      });
    });

    it('deve lançar erro quando a transação falhar', async () => {
      prismaMock.payments.findUnique.mockResolvedValue({
        id: 1n,
        invoice_id: 10n,
        transaction_id: 'TX123',
        invoices: {
          subscription_id: 100n,
        },
      });

      prismaMock.payments.update.mockResolvedValue({});
      prismaMock.invoices.update.mockResolvedValue({});
      prismaMock.subscriptions.update.mockResolvedValue({});

      prismaMock.$transaction.mockRejectedValue(
        new Error('Database transaction failed'),
      );

      await expect(service.confirmPayment(1n, 'NEW_TX')).rejects.toThrow(
        'Database transaction failed',
      );
    });

    it('deve impedir confirmar pagamento já concluído', async () => {
      prismaMock.payments.findUnique.mockResolvedValue({
        id: 1n,
        invoice_id: 10n,
        transaction_id: 'TX123',
        status: payment_status.PAID,
        invoices: {
          subscription_id: 100n,
        },
      });

      await expect(service.confirmPayment(1n)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve impedir confirmar uma invoice já paga', async () => {
      prismaMock.payments.findUnique.mockResolvedValue({
        id: 1n,
        invoice_id: 10n,
        status: payment_status.PENDING,
        invoices: {
          subscription_id: 100n,
          status: invoice_status.PAID,
        },
      });

      await expect(service.confirmPayment(1n)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
