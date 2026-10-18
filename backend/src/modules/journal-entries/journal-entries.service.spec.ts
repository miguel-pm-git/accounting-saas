import { BadRequestException, NotFoundException } from '@nestjs/common';

import { Test, TestingModule } from '@nestjs/testing';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  journal_entries_status,
  journal_entry_items_type,
} from '../../generated/prisma/client.js';

import { PrismaService } from '../../prisma/prisma.service.js';

import { JournalEntriesService } from './journal-entries.service.js';

import { LedgerMovementsService } from '../ledger-movements/ledger-movements.service.js';

describe('JournalEntriesService', () => {
  let service: JournalEntriesService;

  const prismaMock = {
    companies: {
      findUnique: vi.fn(),
    },

    journal_entries: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },

    $transaction: vi.fn(),
  };

  const ledgerMovementsServiceMock = {
    generateMovement: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JournalEntriesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: LedgerMovementsService,
          useValue: ledgerMovementsServiceMock,
        },
      ],
    }).compile();

    service = module.get<JournalEntriesService>(JournalEntriesService);
  });

  describe('create', () => {
    it('deve criar lançamento com sucesso', async () => {
      prismaMock.companies.findUnique.mockResolvedValue({
        id: BigInt(1),
      });

      prismaMock.journal_entries.findFirst.mockResolvedValue(null);

      const tx = {
        journal_entries: {
          create: vi.fn().mockResolvedValue({
            id: BigInt(1),
          }),
        },

        journal_entry_items: {
          create: vi.fn().mockResolvedValue({}),
        },
      };

      prismaMock.$transaction.mockImplementation(async (callback) =>
        callback(tx),
      );

      const dto = {
        entry_date: '2026-10-17',
        description: 'Teste',
        items: [
          {
            account_id: 101,
            type: journal_entry_items_type.DEBIT,
            amount: 100,
          },
          {
            account_id: 201,
            type: journal_entry_items_type.CREDIT,
            amount: 100,
          },
        ],
      };

      const result = await service.create(dto as any, BigInt(1), BigInt(1));

      expect(result.id).toBe(BigInt(1));

      expect(tx.journal_entry_items.create).toHaveBeenCalledTimes(2);
    });

    it('deve lançar erro para empresa inexistente', async () => {
      prismaMock.companies.findUnique.mockResolvedValue(null);

      const dto = {
        entry_date: '2026-10-17',
        items: [
          {
            account_id: 101,
            type: journal_entry_items_type.DEBIT,
            amount: 100,
          },
          {
            account_id: 201,
            type: journal_entry_items_type.CREDIT,
            amount: 100,
          },
        ],
      };

      await expect(
        service.create(dto as any, BigInt(1), BigInt(1)),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve impedir lançamento desbalanceado', async () => {
      const dto = {
        entry_date: '2026-10-17',
        items: [
          {
            account_id: 101,
            type: journal_entry_items_type.DEBIT,
            amount: 100,
          },
          {
            account_id: 201,
            type: journal_entry_items_type.CREDIT,
            amount: 90,
          },
        ],
      };

      await expect(
        service.create(dto as any, BigInt(1), BigInt(1)),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve contabilizar lançamento', async () => {
      prismaMock.journal_entries.findFirst.mockResolvedValue({
        id: BigInt(1),
        company_id: BigInt(1),
        status: journal_entries_status.DRAFT,
        journal_entry_items: [{ id: BigInt(10) }, { id: BigInt(11) }],
      });

      const tx = {
        journal_entries: {
          update: vi.fn().mockResolvedValue({}),
        },
      };

      prismaMock.$transaction.mockImplementation(async (callback) =>
        callback(tx),
      );

      const result = await service.post(BigInt(1), BigInt(1));

      expect(ledgerMovementsServiceMock.generateMovement).toHaveBeenCalledTimes(
        2,
      );

      expect(tx.journal_entries.update).toHaveBeenCalledWith({
        where: {
          id: BigInt(1),
        },
        data: {
          status: journal_entries_status.POSTED,
        },
      });

      expect(result.success).toBe(true);
    });

    it('deve impedir contabilização de lançamento já contabilizado', async () => {
      prismaMock.journal_entries.findFirst.mockResolvedValue({
        id: BigInt(1),
        status: journal_entries_status.POSTED,
        journal_entry_items: [],
      });

      await expect(service.post(BigInt(1), BigInt(1))).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar erro quando lançamento não existir', async () => {
      prismaMock.journal_entries.findFirst.mockResolvedValue(null);

      await expect(service.post(BigInt(999), BigInt(1))).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve impedir contabilização sem itens', async () => {
      prismaMock.journal_entries.findFirst.mockResolvedValue({
        id: BigInt(1),
        status: journal_entries_status.DRAFT,
        journal_entry_items: [],
      });

      await expect(service.post(BigInt(1), BigInt(1))).rejects.toThrow(
        BadRequestException,
      );
    });
    
  });

  describe('update', () => {
    it('deve impedir alteração de lançamento postado', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue({
        id: BigInt(1),
        status: journal_entries_status.POSTED,
      } as any);

      await expect(
        service.update(BigInt(1), BigInt(1), {
          description: 'Novo texto',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('deve impedir remoção de lançamento postado', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue({
        id: BigInt(1),
        status: journal_entries_status.POSTED,
      } as any);

      await expect(service.remove(BigInt(1), BigInt(1))).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('deve listar lançamentos', async () => {
      prismaMock.journal_entries.findMany.mockResolvedValue([]);

      const result = await service.findAll(BigInt(1));

      expect(result).toEqual([]);
    });
  });
});
