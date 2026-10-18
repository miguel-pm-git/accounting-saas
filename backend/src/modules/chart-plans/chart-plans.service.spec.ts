import { BadRequestException, NotFoundException } from '@nestjs/common';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChartPlansService } from './chart-plans.service.js';

describe('ChartPlansService', () => {
  let service: ChartPlansService;

  const prismaMock = {
    chart_plans: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    chart_account_templates: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    companies: {
      count: vi.fn(),
      findUnique: vi.fn(),
    },
    chart_accounts: {
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();

    service = new ChartPlansService(prismaMock as any);
  });

  describe('create', () => {
    it('deve criar um plano', async () => {
      prismaMock.chart_plans.findUnique.mockResolvedValue(null);

      prismaMock.chart_plans.create.mockResolvedValue({
        id: BigInt(1),
        code: 'STANDARD',
        name: 'Plano Padrão',
      });

      const result = await service.create({
        code: 'STANDARD',
        name: 'Plano Padrão',
      });

      expect(prismaMock.chart_plans.create).toHaveBeenCalled();

      expect(result.id).toBe('1');
    });

    it('deve impedir código duplicado', async () => {
      prismaMock.chart_plans.findUnique.mockResolvedValue({
        id: BigInt(1),
        code: 'STANDARD',
      });

      await expect(
        service.create({
          code: 'STANDARD',
          name: 'Plano Padrão',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('deve retornar plano existente', async () => {
      prismaMock.chart_plans.findUnique.mockResolvedValue({
        id: BigInt(1),
        code: 'STANDARD',
      });

      const result = await service.findOne(BigInt(1));

      expect(result.code).toBe('STANDARD');
    });

    it('deve lançar exceção se não existir', async () => {
      prismaMock.chart_plans.findUnique.mockResolvedValue(null);

      await expect(service.findOne(BigInt(999))).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar plano', async () => {
      prismaMock.chart_plans.findUnique
        .mockResolvedValueOnce({
          id: BigInt(1),
          code: 'STANDARD',
        })
        .mockResolvedValueOnce(null);

      prismaMock.chart_plans.update.mockResolvedValue({
        id: BigInt(1),
        code: 'STANDARD',
        name: 'Plano Atualizado',
      });

      const result = await service.update(BigInt(1), {
        name: 'Plano Atualizado',
      });

      expect(result.name).toBe('Plano Atualizado');
    });

    it('deve impedir atualização para código já existente', async () => {
      prismaMock.chart_plans.findUnique
        .mockResolvedValueOnce({
          id: BigInt(1),
          code: 'STANDARD',
        })
        .mockResolvedValueOnce({
          id: BigInt(2),
          code: 'IFRS',
        });

      await expect(
        service.update(BigInt(1), {
          code: 'IFRS',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('deve remover plano', async () => {
      prismaMock.chart_plans.findUnique.mockResolvedValue({
        id: BigInt(1),
      });

      prismaMock.chart_account_templates.count.mockResolvedValue(0);

      prismaMock.companies.count.mockResolvedValue(0);

      prismaMock.chart_plans.delete.mockResolvedValue({
        id: BigInt(1),
      });

      const result = await service.remove(BigInt(1));

      expect(prismaMock.chart_plans.delete).toHaveBeenCalled();

      expect(result).toEqual({
        message: 'Plano removido com sucesso',
      });
    });

    it('deve impedir exclusão quando houver templates', async () => {
      prismaMock.chart_plans.findUnique.mockResolvedValue({
        id: BigInt(1),
      });

      prismaMock.chart_account_templates.count.mockResolvedValue(5);

      await expect(service.remove(BigInt(1))).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve impedir exclusão quando houver empresas usando o plano', async () => {
      prismaMock.chart_plans.findUnique.mockResolvedValue({
        id: BigInt(1),
      });

      prismaMock.chart_account_templates.count.mockResolvedValue(0);

      prismaMock.companies.count.mockResolvedValue(2);

      await expect(service.remove(BigInt(1))).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar exceção para plano inexistente', async () => {
      prismaMock.chart_plans.findUnique.mockResolvedValue(null);

      await expect(service.remove(BigInt(999))).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('initializeCompanyAccounts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve lançar erro quando empresa não existir', async () => {
    prismaMock.companies.findUnique.mockResolvedValue(null);

    await expect(
      service.initializeCompanyAccounts(
        BigInt(1),
        BigInt(1),
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve lançar erro quando não houver templates', async () => {
    prismaMock.companies.findUnique.mockResolvedValue({
      id: BigInt(1),
    });

    prismaMock.chart_account_templates.findMany.mockResolvedValue([]);

    await expect(
      service.initializeCompanyAccounts(
        BigInt(1),
        BigInt(1),
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve impedir inicialização duplicada', async () => {
    prismaMock.companies.findUnique.mockResolvedValue({
      id: BigInt(1),
    });

    prismaMock.chart_account_templates.findMany.mockResolvedValue([
      {
        id: BigInt(1),
        code: '1',
      },
    ]);

    prismaMock.chart_accounts.count.mockResolvedValue(5);

    await expect(
      service.initializeCompanyAccounts(
        BigInt(1),
        BigInt(1),
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve copiar templates para chart_accounts', async () => {
    prismaMock.companies.findUnique.mockResolvedValue({
      id: BigInt(1),
    });

    prismaMock.chart_account_templates.findMany.mockResolvedValue([
      {
        id: BigInt(1),
        code: '1',
        name: 'ATIVO',
        category: 'ASSET',
        parent_id: null,
        analytical: false,
        active: true,
      },
      {
        id: BigInt(2),
        code: '1.1',
        name: 'CAIXA',
        category: 'ASSET',
        parent_id: BigInt(1),
        analytical: true,
        active: true,
      },
    ]);

    prismaMock.chart_accounts.count.mockResolvedValue(0);

    const tx = {
      chart_accounts: {
        create: vi
          .fn()
          .mockResolvedValueOnce({
            id: BigInt(100),
          })
          .mockResolvedValueOnce({
            id: BigInt(101),
          }),
        update: vi.fn().mockResolvedValue({}),
      },
    };

    prismaMock.$transaction.mockImplementation(
      async (callback) => {
        return callback(tx);
      },
    );

    const result =
      await service.initializeCompanyAccounts(
        BigInt(1),
        BigInt(1),
      );

    expect(
      tx.chart_accounts.create,
    ).toHaveBeenCalledTimes(2);

    expect(
      tx.chart_accounts.update,
    ).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
      success: true,
      companyId: BigInt(1),
      chartPlanId: BigInt(1),
      accountsCreated: 2,
    });
  });

  it('deve reconstruir a hierarquia corretamente', async () => {
    prismaMock.companies.findUnique.mockResolvedValue({
      id: BigInt(1),
    });

    prismaMock.chart_account_templates.findMany.mockResolvedValue([
      {
        id: BigInt(10),
        code: '1',
        name: 'ATIVO',
        category: 'ASSET',
        parent_id: null,
        analytical: false,
        active: true,
      },
      {
        id: BigInt(20),
        code: '1.1',
        name: 'CAIXA',
        category: 'ASSET',
        parent_id: BigInt(10),
        analytical: true,
        active: true,
      },
    ]);

    prismaMock.chart_accounts.count.mockResolvedValue(0);

    const updateMock = vi.fn();

    const tx = {
      chart_accounts: {
        create: vi
          .fn()
          .mockResolvedValueOnce({
            id: BigInt(100),
          })
          .mockResolvedValueOnce({
            id: BigInt(200),
          }),
        update: updateMock,
      },
    };

    prismaMock.$transaction.mockImplementation(
      async (callback) => callback(tx),
    );

    await service.initializeCompanyAccounts(
      BigInt(1),
      BigInt(1),
    );

    expect(updateMock).toHaveBeenCalledWith({
      where: {
        id: BigInt(200),
      },
      data: {
        parent_id: BigInt(100),
      },
    });
  });
});
});
