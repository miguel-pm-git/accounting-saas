import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';

import { LedgerFilterDto } from './dto/ledger-filter.dto.js';

@Injectable()
export class LedgerMovementsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: bigint, filter?: LedgerFilterDto) {
    return this.prisma.ledger_movements.findMany({
      where: {
        company_id: companyId,

        account_id: filter?.account_id ? BigInt(filter.account_id) : undefined,

        movement_date: {
          gte: filter?.start_date ? new Date(filter.start_date) : undefined,

          lte: filter?.end_date ? new Date(filter.end_date) : undefined,
        },
      },

      include: {
        chart_accounts: true,
        journal_entry_items: true,
      },

      orderBy: [
        {
          movement_date: 'asc',
        },
        {
          id: 'asc',
        },
      ],
    });
  }

  async findByAccount(companyId: bigint, accountId: bigint) {
    return this.prisma.ledger_movements.findMany({
      where: {
        company_id: companyId,
        account_id: accountId,
      },

      orderBy: {
        movement_date: 'asc',
      },
    });
  }

  async getBalance(companyId: bigint, accountId: bigint) {
    const lastMovement = await this.prisma.ledger_movements.findFirst({
      where: {
        company_id: companyId,
        account_id: accountId,
      },

      orderBy: [
        {
          movement_date: 'desc',
        },
        {
          id: 'desc',
        },
      ],
    });

    return {
      accountId,
      balance: lastMovement?.running_balance ?? 0,
    };
  }

  async findOne(id: bigint, companyId: bigint) {
    const movement = await this.prisma.ledger_movements.findFirst({
      where: {
        id,
        company_id: companyId,
      },

      include: {
        chart_accounts: true,
        journal_entry_items: true,
      },
    });

    if (!movement) {
      throw new NotFoundException('Movimento não encontrado.');
    }

    return movement;
  }

  async generateMovement(journalItemId: bigint) {
    const item = await this.prisma.journal_entry_items.findUnique({
      where: {
        id: journalItemId,
      },

      include: {
        journal_entries: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Item do lançamento não encontrado.');
    }

    const lastMovement = await this.prisma.ledger_movements.findFirst({
      where: {
        company_id: item.journal_entries.company_id,

        account_id: item.account_id,
      },

      orderBy: [
        {
          movement_date: 'desc',
        },
        {
          id: 'desc',
        },
      ],
    });

    let balance = Number(lastMovement?.running_balance ?? 0);

    if (item.type === 'DEBIT') {
      balance += Number(item.amount);
    } else {
      balance -= Number(item.amount);
    }

    return this.prisma.ledger_movements.create({
      data: {
        company_id: item.journal_entries.company_id,

        account_id: item.account_id,

        journal_item_id: item.id,

        movement_date: item.journal_entries.entry_date,

        debit: item.type === 'DEBIT' ? item.amount : 0,

        credit: item.type === 'CREDIT' ? item.amount : 0,

        running_balance: balance,
      },
    });
  }
}
