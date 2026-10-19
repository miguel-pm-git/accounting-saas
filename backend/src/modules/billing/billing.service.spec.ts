import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  invoice_status,
  subscription_status,
} from '../../generated/prisma/client.js';

import { BillingService } from './billing.service.js';

describe('BillingService', () => {
  let service: BillingService;

  const prismaMock = {
    subscriptions: {
      findMany: vi.fn(),
      update: vi.fn(),
    },

    invoices: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
  };

  const invoicesServiceMock = {
    generateInvoice: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    service = new BillingService(prismaMock as any, invoicesServiceMock as any);
  });

  describe('processExpiredTrials', () => {
    it('deve gerar invoice para trials expirados', async () => {
      prismaMock.subscriptions.findMany.mockResolvedValue([
        {
          id: 1n,
          status: subscription_status.TRIALING,
        },
      ]);

      prismaMock.subscriptions.update.mockResolvedValue({});

      await service.processExpiredTrials();

      expect(invoicesServiceMock.generateInvoice).toHaveBeenCalledWith(1n);

      expect(prismaMock.subscriptions.update).toHaveBeenCalledWith({
        where: {
          id: 1n,
        },
        data: {
          status: subscription_status.PAST_DUE,
        },
      });
    });
  });

  it('não deve gerar invoice quando não houver trials expirados', async () => {
    prismaMock.subscriptions.findMany.mockResolvedValue([]);

    await service.processExpiredTrials();

    expect(invoicesServiceMock.generateInvoice).not.toHaveBeenCalled();
  });

  describe('processOverdueInvoices', () => {
    it('deve marcar invoices como overdue', async () => {
      prismaMock.invoices.updateMany.mockResolvedValue({
        count: 5,
      });

      await service.processOverdueInvoices();

      expect(prismaMock.invoices.updateMany).toHaveBeenCalled();
    });
  });

  describe('generateRenewalInvoices', () => {
    it('deve gerar invoice para assinatura vencida', async () => {
      prismaMock.subscriptions.findMany.mockResolvedValue([
        {
          id: 10n,
        },
      ]);

      prismaMock.invoices.findFirst.mockResolvedValue(null);

      prismaMock.subscriptions.update.mockResolvedValue({});

      await service.generateRenewalInvoices();

      expect(invoicesServiceMock.generateInvoice).toHaveBeenCalledWith(10n);

      expect(prismaMock.subscriptions.update).toHaveBeenCalled();
    });
  });

  it('não deve gerar invoice quando já existir pendente', async () => {
    prismaMock.subscriptions.findMany.mockResolvedValue([
      {
        id: 10n,
      },
    ]);

    prismaMock.invoices.findFirst.mockResolvedValue({
      id: 99n,
      status: invoice_status.PENDING,
    });

    await service.generateRenewalInvoices();

    expect(invoicesServiceMock.generateInvoice).not.toHaveBeenCalled();
  });

  describe('processDelinquentSubscriptions', () => {
    it('deve cancelar assinaturas inadimplentes', async () => {
      prismaMock.invoices.findMany.mockResolvedValue([
        {
          subscription_id: 200n,
        },
      ]);

      prismaMock.subscriptions.update.mockResolvedValue({});

      await service.processDelinquentSubscriptions();

      expect(prismaMock.subscriptions.update).toHaveBeenCalledWith({
        where: {
          id: 200n,
        },
        data: {
          status: subscription_status.CANCELED,
          cancelled_at: expect.any(Date),
        },
      });
    });
  });

  it('não deve cancelar assinaturas quando não houver invoices vencidas', async () => {
    prismaMock.invoices.findMany.mockResolvedValue([]);

    await service.processDelinquentSubscriptions();

    expect(prismaMock.subscriptions.update).not.toHaveBeenCalled();
  });

  it('não deve gerar invoice quando já existir invoice aberta para trial expirado', async () => {
    prismaMock.subscriptions.findMany.mockResolvedValue([
      {
        id: 1n,
        status: subscription_status.TRIALING,
      },
    ]);

    prismaMock.invoices.findFirst.mockResolvedValue({
      id: 50n,
      status: invoice_status.PENDING,
    });

    await service.processExpiredTrials();

    expect(invoicesServiceMock.generateInvoice).not.toHaveBeenCalled();

    expect(prismaMock.subscriptions.update).not.toHaveBeenCalled();
  });
});
