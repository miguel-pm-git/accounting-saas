import { BadRequestException, NotFoundException } from '@nestjs/common';

import { Test, TestingModule } from '@nestjs/testing';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  journal_entries_status,
  journal_entry_items_type,
} from '../../generated/prisma/client.js';

import { PrismaService } from '../../prisma/prisma.service.js';

import { JournalReversalsService } from './journal-reversals.service.js';

describe('JournalReversalsService', () => {
  let service: JournalReversalsService;

  const prismaMock = {
    journal_entries: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },

    journal_entry_items: {
      create: vi.fn(),
    },

    journal_reversals: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },

    $transaction: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JournalReversalsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<JournalReversalsService>(JournalReversalsService);
  });

  describe('reverse', () => {
    it('deve lançar exceção quando lançamento não existir', async () => {
      prismaMock.journal_entries.findFirst.mockResolvedValue(null);

      await expect(
        service.reverse(BigInt(1), BigInt(1), BigInt(1), 'Teste'),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve impedir estorno de lançamento não contabilizado', async () => {
      prismaMock.journal_entries.findFirst.mockResolvedValue({
        id: BigInt(1),
        status: journal_entries_status.DRAFT,
        journal_entry_items: [],
      });

      await expect(
        service.reverse(BigInt(1), BigInt(1), BigInt(1), 'Teste'),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve impedir duplo estorno', async () => {
      prismaMock.journal_entries.findFirst.mockResolvedValue({
        id: BigInt(1),
        status: journal_entries_status.POSTED,
        journal_entry_items: [],
      });

      prismaMock.journal_reversals.findUnique.mockResolvedValue({
        id: BigInt(10),
      });

      await expect(
        service.reverse(BigInt(1), BigInt(1), BigInt(1), 'Teste'),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve criar estorno com sucesso', async () => {
      const originalEntry = {
        id: BigInt(1),
        entry_number: '100',
        company_id: BigInt(1),
        total_debit: 100,
        total_credit: 100,
        status: journal_entries_status.POSTED,

        journal_entry_items: [
          {
            id: BigInt(10),
            account_id: BigInt(100),
            amount: 100,
            description: 'Débito',
            type: journal_entry_items_type.DEBIT,
          },

          {
            id: BigInt(11),
            account_id: BigInt(200),
            amount: 100,
            description: 'Crédito',
            type: journal_entry_items_type.CREDIT,
          },
        ],
      };

      prismaMock.journal_entries.findFirst
        .mockResolvedValueOnce(originalEntry)
        .mockResolvedValueOnce({
          id: BigInt(99),
          entry_number: '100',
        });

      prismaMock.journal_reversals.findUnique.mockResolvedValue(null);

      const tx = {
        journal_entries: {
          create: vi.fn().mockResolvedValue({
            id: BigInt(2),
          }),

          update: vi.fn().mockResolvedValue({}),
        },

        journal_entry_items: {
          create: vi.fn().mockResolvedValue({}),
        },

        journal_reversals: {
          create: vi.fn().mockResolvedValue({
            id: BigInt(50),
          }),
        },
      };

      prismaMock.$transaction.mockImplementation(async (callback) =>
        callback(tx),
      );

      const result = await service.reverse(
        BigInt(1),
        BigInt(1),
        BigInt(1),
        'Lançamento incorreto',
      );

      expect(tx.journal_entries.create).toHaveBeenCalledTimes(1);

      expect(tx.journal_entry_items.create).toHaveBeenCalledTimes(2);

      expect(tx.journal_entries.update).toHaveBeenCalledTimes(1);

      expect(tx.journal_reversals.create).toHaveBeenCalledTimes(1);

      expect(result).toEqual({
        reversal: {
          id: BigInt(50),
        },
        reversalEntryId: BigInt(2),
      });
    });

    it('deve inverter débito para crédito', async () => {
      const originalEntry = {
        id: BigInt(1),
        entry_number: '100',
        company_id: BigInt(1),
        total_debit: 100,
        total_credit: 100,
        status: journal_entries_status.POSTED,

        journal_entry_items: [
          {
            id: BigInt(10),
            account_id: BigInt(100),
            amount: 100,
            description: 'Teste',
            type: journal_entry_items_type.DEBIT,
          },
        ],
      };

      prismaMock.journal_entries.findFirst
        .mockResolvedValueOnce(originalEntry)
        .mockResolvedValueOnce(null);

      prismaMock.journal_reversals.findUnique.mockResolvedValue(null);

      const itemCreateMock = vi.fn();

      const tx = {
        journal_entries: {
          create: vi.fn().mockResolvedValue({
            id: BigInt(2),
          }),

          update: vi.fn(),
        },

        journal_entry_items: {
          create: itemCreateMock,
        },

        journal_reversals: {
          create: vi.fn().mockResolvedValue({
            id: BigInt(1),
          }),
        },
      };

      prismaMock.$transaction.mockImplementation(async (callback) =>
        callback(tx),
      );

      await service.reverse(BigInt(1), BigInt(1), BigInt(1), 'Teste');

      expect(itemCreateMock).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: journal_entry_items_type.CREDIT,
        }),
      });
    });
  });
});
