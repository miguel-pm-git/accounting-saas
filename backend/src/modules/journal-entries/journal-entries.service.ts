import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  journal_entries_source_module,
  journal_entries_status,
  journal_entry_items_type,
} from '../../generated/prisma/client.js';

import { PrismaService } from '../../prisma/prisma.service.js';

import { CreateJournalEntryDto } from './dto/create-journal-entry.dto.js';
import { UpdateJournalEntryDto } from './dto/update-journal-entry.dto.js';
import { LedgerMovementsService } from '../ledger-movements/ledger-movements.service.js';

@Injectable()
export class JournalEntriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerMovementsService: LedgerMovementsService,
  ) {}

  async create(dto: CreateJournalEntryDto, companyId: bigint, userId: bigint) {
    const totalDebit = dto.items
      .filter((item) => item.type === journal_entry_items_type.DEBIT)
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const totalCredit = dto.items
      .filter((item) => item.type === journal_entry_items_type.CREDIT)
      .reduce((sum, item) => sum + Number(item.amount), 0);

    if (totalDebit <= 0) {
      throw new BadRequestException(
        'O total de débitos deve ser maior que zero.',
      );
    }

    if (totalDebit !== totalCredit) {
      throw new BadRequestException(
        'Débitos e créditos devem possuir o mesmo valor.',
      );
    }

    const company = await this.prisma.companies.findUnique({
      where: {
        id: companyId,
      },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada.');
    }

    const lastEntry = await this.prisma.journal_entries.findFirst({
      where: {
        company_id: companyId,
      },
      orderBy: {
        id: 'desc',
      },
    });

    const nextEntryNumber = lastEntry
      ? String(Number(lastEntry.entry_number) + 1)
      : '1';

    return this.prisma.$transaction(async (tx) => {
      const entry = await tx.journal_entries.create({
        data: {
          company_id: companyId,
          entry_number: nextEntryNumber,
          entry_date: new Date(dto.entry_date),
          description: dto.description,
          total_debit: totalDebit,
          total_credit: totalCredit,
          source_module: journal_entries_source_module.MANUAL,
          status: journal_entries_status.DRAFT,
          created_by: userId,
        },
      });

      for (const item of dto.items) {
        await tx.journal_entry_items.create({
          data: {
            entry_id: entry.id,
            account_id: BigInt(item.account_id),
            type: item.type,
            amount: item.amount,
            description: item.description,
          },
        });
      }

      return entry;
    });
  }

  async findAll(companyId: bigint) {
    return this.prisma.journal_entries.findMany({
      where: {
        company_id: companyId,
      },
      include: {
        journal_entry_items: true,
      },
      orderBy: {
        entry_date: 'desc',
      },
    });
  }

  async findOne(id: bigint, companyId: bigint) {
    const entry = await this.prisma.journal_entries.findFirst({
      where: {
        id,
        company_id: companyId,
      },
      include: {
        journal_entry_items: true,
      },
    });

    if (!entry) {
      throw new NotFoundException('Lançamento não encontrado.');
    }

    return entry;
  }

  async update(id: bigint, companyId: bigint, dto: UpdateJournalEntryDto) {
    const entry = await this.findOne(id, companyId);

    if (entry.status !== journal_entries_status.DRAFT) {
      throw new BadRequestException(
        'Somente lançamentos em rascunho podem ser alterados.',
      );
    }

    return this.prisma.journal_entries.update({
      where: {
        id,
      },
      data: {
        entry_date: dto.entry_date ? new Date(dto.entry_date) : undefined,
        description: dto.description,
      },
    });
  }

  async remove(id: bigint, companyId: bigint) {
    const entry = await this.findOne(id, companyId);

    if (entry.status !== journal_entries_status.DRAFT) {
      throw new BadRequestException(
        'Somente lançamentos em rascunho podem ser excluídos.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.journal_entry_items.deleteMany({
        where: {
          entry_id: id,
        },
      });

      return tx.journal_entries.delete({
        where: {
          id,
        },
      });
    });
  }

  async post(id: bigint, companyId: bigint) {
    const entry = await this.prisma.journal_entries.findFirst({
      where: {
        id,
        company_id: companyId,
      },
      include: {
        journal_entry_items: true,
      },
    });

    if (!entry) {
      throw new NotFoundException('Lançamento não encontrado.');
    }

    if (entry.status !== journal_entries_status.DRAFT) {
      throw new BadRequestException(
        'Somente lançamentos em rascunho podem ser contabilizados.',
      );
    }

    if (!entry.journal_entry_items.length) {
      throw new BadRequestException('O lançamento não possui itens.');
    }

    await this.prisma.$transaction(async (tx) => {
      for (const item of entry.journal_entry_items) {
        await this.ledgerMovementsService.generateMovement(item.id);
      }

      await tx.journal_entries.update({
        where: {
          id: entry.id,
        },
        data: {
          status: journal_entries_status.POSTED,
        },
      });
    });

    return {
      success: true,
      entryId: entry.id,
      status: journal_entries_status.POSTED,
    };
  }
}
