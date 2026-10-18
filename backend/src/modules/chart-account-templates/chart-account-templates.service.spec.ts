import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { ChartAccountTemplatesService } from './chart-account-templates.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

describe('ChartAccountTemplatesService', () => {
  let service: ChartAccountTemplatesService;

  const prismaMock = {
    chart_account_templates: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChartAccountTemplatesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ChartAccountTemplatesService>(
      ChartAccountTemplatesService,
    );
  });

  describe('create', () => {
    it('deve criar template com sucesso', async () => {
      prismaMock.chart_account_templates.findFirst.mockResolvedValue(null);

      prismaMock.chart_account_templates.create.mockResolvedValue({
        id: BigInt(1),
        chart_plan_id: BigInt(1),
        code: '1.1.01',
        name: 'Caixa',
      });

      const result = await service.create({
        chart_plan_id: 1,
        code: '1.1.01',
        name: 'Caixa',
        category: 'ASSET',
      } as any);

      expect(result.id).toBe(BigInt(1));
      expect(prismaMock.chart_account_templates.create).toHaveBeenCalled();
    });

    it('deve impedir código duplicado no mesmo plano', async () => {
      prismaMock.chart_account_templates.findFirst.mockResolvedValue({
        id: BigInt(1),
      });

      await expect(
        service.create({
          chart_plan_id: 1,
          code: '1.1.01',
          name: 'Caixa',
          category: 'ASSET',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve validar conta pai inexistente', async () => {
      prismaMock.chart_account_templates.findFirst.mockResolvedValue(null);

      prismaMock.chart_account_templates.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          chart_plan_id: 1,
          code: '1.1.01',
          name: 'Caixa',
          category: 'ASSET',
          parent_id: 999,
        } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('deve retornar template existente', async () => {
      prismaMock.chart_account_templates.findUnique.mockResolvedValue({
        id: BigInt(1),
        code: '1.1.01',
      });

      const result = await service.findOne(BigInt(1));

      expect(result.id).toBe(BigInt(1));
    });

    it('deve lançar erro quando não encontrar', async () => {
      prismaMock.chart_account_templates.findUnique.mockResolvedValue(null);

      await expect(service.findOne(BigInt(999))).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar template', async () => {
      prismaMock.chart_account_templates.findUnique
        .mockResolvedValueOnce({
          id: BigInt(1),
          chart_plan_id: BigInt(1),
        })
        .mockResolvedValueOnce({
          id: BigInt(1),
          chart_plan_id: BigInt(1),
        });

      prismaMock.chart_account_templates.findFirst.mockResolvedValue(null);

      prismaMock.chart_account_templates.update.mockResolvedValue({
        id: BigInt(1),
        name: 'Caixa Atualizado',
      });

      const result = await service.update(BigInt(1), {
        name: 'Caixa Atualizado',
      } as any);

      expect(result.name).toBe('Caixa Atualizado');
    });

    it('deve impedir alteração para código duplicado', async () => {
      prismaMock.chart_account_templates.findUnique
        .mockResolvedValueOnce({
          id: BigInt(1),
          chart_plan_id: BigInt(1),
        })
        .mockResolvedValueOnce({
          id: BigInt(1),
          chart_plan_id: BigInt(1),
        });

      prismaMock.chart_account_templates.findFirst.mockResolvedValue({
        id: BigInt(2),
      });

      await expect(
        service.update(BigInt(1), {
          code: '1.1.01',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('deve remover quando não possui filhos', async () => {
      prismaMock.chart_account_templates.findUnique.mockResolvedValue({
        id: BigInt(1),
      });

      prismaMock.chart_account_templates.count.mockResolvedValue(0);

      prismaMock.chart_account_templates.delete.mockResolvedValue({
        id: BigInt(1),
      });

      const result = await service.remove(BigInt(1));

      expect(result.id).toBe(BigInt(1));
    });

    it('deve impedir remoção quando possui filhos', async () => {
      prismaMock.chart_account_templates.findUnique.mockResolvedValue({
        id: BigInt(1),
      });

      prismaMock.chart_account_templates.count.mockResolvedValue(2);

      await expect(service.remove(BigInt(1))).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('deve listar templates', async () => {
      prismaMock.chart_account_templates.findMany.mockResolvedValue([
        {
          id: BigInt(1),
          code: '1.1.01',
        },
      ]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
    });
  });

  describe('findByPlan', () => {
    it('deve listar templates por plano', async () => {
      prismaMock.chart_account_templates.findMany.mockResolvedValue([
        {
          id: BigInt(1),
          chart_plan_id: BigInt(1),
        },
      ]);

      const result = await service.findByPlan(BigInt(1));

      expect(result).toHaveLength(1);
    });
  });
});
