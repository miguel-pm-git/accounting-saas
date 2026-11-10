import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';
import { serializeBigInt } from '../../common/utils/bigint.util.js';

import { Prisma } from '../../generated/prisma/client.js';

import { CreateBankAccountDto } from './dto/create-bank-account.dto.js';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto.js';

@Injectable()
export class BankAccountsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    dto: CreateBankAccountDto,
    companyId: bigint,
  ) {
    try {
      const account = await this.prisma.bank_accounts.create({
        data: {
          company_id: companyId,
          bank_code: dto.bankCode,
          bank_name: dto.bankName,
          agency: dto.agency,
          account_number: dto.accountNumber,
        },
      });

      return serializeBigInt(account);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError
      ) {
        throw new ConflictException(
          'Erro ao criar conta bancária',
        );
      }

      throw error;
    }
  }

  async findAll(companyId: bigint) {
    const accounts =
      await this.prisma.bank_accounts.findMany({
        where: {
          company_id: companyId,
        },
        orderBy: {
          bank_name: 'asc',
        },
      });

    return serializeBigInt(accounts);
  }

  async findOne(
    id: bigint,
    companyId: bigint,
  ) {
    const account =
      await this.prisma.bank_accounts.findFirst({
        where: {
          id,
          company_id: companyId,
        },
      });

    if (!account) {
      throw new NotFoundException(
        'Conta bancária não encontrada',
      );
    }

    return serializeBigInt(account);
  }

  async update(
    id: bigint,
    companyId: bigint,
    dto: UpdateBankAccountDto,
  ) {
    await this.findOne(id, companyId);

    const account =
      await this.prisma.bank_accounts.update({
        where: {
          id,
        },
        data: {
          bank_code: dto.bankCode,
          bank_name: dto.bankName,
          agency: dto.agency,
          account_number: dto.accountNumber,
          active: dto.active,
        },
      });

    return serializeBigInt(account);
  }

  async deactivate(
    id: bigint,
    companyId: bigint,
  ) {
    await this.findOne(id, companyId);

    const account =
      await this.prisma.bank_accounts.update({
        where: {
          id,
        },
        data: {
          active: false,
        },
      });

    return serializeBigInt(account);
  }
}