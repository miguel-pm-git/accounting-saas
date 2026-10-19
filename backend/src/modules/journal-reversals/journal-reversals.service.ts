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

import { TenantContext } from '../../common/tenant/tenant.context.js';
import { TenantBaseService } from '../../common/base/tenant-base.service.js';

@Injectable()
export class JournalReversalsService extends TenantBaseService {
  constructor(
    tenantContext: TenantContext,
    private readonly prisma: PrismaService,
  ) {
    super(tenantContext);
  }

  async reverse(entryId: bigint, userId: bigint, reason: string) {
    const companyId = this.getCompanyId();

    const original = await this.prisma.journal_entries.findFirst({
      where: {
        id: entryId,
        company_id: companyId,
      },
      include: {
        journal_entry_items: true,
      },
    });

    if (!original) {
      throw new NotFoundException('Lançamento não encontrado.');
    }

    if (original.status !== journal_entries_status.POSTED) {
      throw new BadRequestException(
        'Somente lançamentos contabilizados podem ser estornados.',
      );
    }

    const existingReversal = await this.prisma.journal_reversals.findUnique({
      where: {
        original_entry_id: entryId,
      },
    });

    if (existingReversal) {
      throw new BadRequestException('Lançamento já estornado.');
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
      const reversalEntry = await tx.journal_entries.create({
        data: {
          company_id: companyId,
          entry_number: nextEntryNumber,
          entry_date: new Date(),
          description: `Estorno lançamento ${original.entry_number}`,
          total_debit: original.total_debit,
          total_credit: original.total_credit,
          source_module: journal_entries_source_module.MANUAL,
          status: journal_entries_status.POSTED,
          created_by: userId,
          reversal_of_entry_id: original.id,
        },
      });

      for (const item of original.journal_entry_items) {
        await tx.journal_entry_items.create({
          data: {
            entry_id: reversalEntry.id,
            account_id: item.account_id,
            amount: item.amount,
            description: item.description,

            type:
              item.type === journal_entry_items_type.DEBIT
                ? journal_entry_items_type.CREDIT
                : journal_entry_items_type.DEBIT,
          },
        });
      }

      await tx.journal_entries.update({
        where: {
          id: original.id,
        },
        data: {
          reversed_by_entry_id: reversalEntry.id,
        },
      });

      const journalReversal = await tx.journal_reversals.create({
        data: {
          company_id: companyId,
          original_entry_id: original.id,
          reversal_entry_id: reversalEntry.id,
          reason,
          reversed_by_user_id: userId,
        },
      });

      return {
        reversal: journalReversal,
        reversalEntryId: reversalEntry.id,
      };
    });
  }
}
