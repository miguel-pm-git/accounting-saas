import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';
import { serializeBigInt } from '../../common/utils/bigint.util.js';

import { Prisma } from '../../generated/prisma/client.js';

import { BANK_CODES } from '../../common/constants/bank-codes.constants.js';

import { CreateBankAccountDto } from './dto/create-bank-account.dto.js';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto.js';

@Injectable()
export class BankAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  private validateBankCode(bankCode: string): void {
    if (!(bankCode in BANK_CODES)) {
      throw new BadRequestException(`Código bancário inválido: ${bankCode}`);
    }
  }

  private getOfficialBankName(bankCode?: string | null): string | null {
    if (!bankCode) {
      return null;
    }

    return BANK_CODES[bankCode] ?? `Banco não catalogado (${bankCode})`;
  }

  private enrichAccount<T extends { bank_code?: string | null }>(account: T) {
    return {
      ...account,
      official_bank_name: this.getOfficialBankName(account.bank_code),
    };
  }

  async create(dto: CreateBankAccountDto, companyId: bigint) {
    this.validateBankCode(dto.bankCode);

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

      return serializeBigInt(this.enrichAccount(account));
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Conta bancária já cadastrada para esta empresa',
        );
      }

      throw error;
    }
  }

  async findAll(companyId: bigint) {
    const accounts = await this.prisma.bank_accounts.findMany({
      where: {
        company_id: companyId,
      },
      orderBy: {
        bank_name: 'asc',
      },
    });

    return serializeBigInt(
      accounts.map((account) => this.enrichAccount(account)),
    );
  }

  async findOne(id: bigint, companyId: bigint) {
    const account = await this.prisma.bank_accounts.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!account) {
      throw new NotFoundException('Conta bancária não encontrada');
    }

    return serializeBigInt(this.enrichAccount(account));
  }

  async update(id: bigint, companyId: bigint, dto: UpdateBankAccountDto) {
    await this.findOne(id, companyId);

    if (dto.bankCode) {
      this.validateBankCode(dto.bankCode);
    }

    const data: Prisma.bank_accountsUpdateInput = {};

    if (dto.bankCode !== undefined) {
      data.bank_code = dto.bankCode;
    }

    if (dto.bankName !== undefined) {
      data.bank_name = dto.bankName;
    }

    if (dto.agency !== undefined) {
      data.agency = dto.agency;
    }

    if (dto.accountNumber !== undefined) {
      data.account_number = dto.accountNumber;
    }

    if (dto.active !== undefined) {
      data.active = dto.active;
    }

    try {
      const account = await this.prisma.bank_accounts.update({
        where: {
          id,
        },
        data,
      });

      return serializeBigInt(this.enrichAccount(account));
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Conta bancária já cadastrada para esta empresa',
        );
      }

      throw error;
    }
  }

  async deactivate(id: bigint, companyId: bigint) {
    await this.findOne(id, companyId);

    const account = await this.prisma.bank_accounts.update({
      where: {
        id,
      },
      data: {
        active: false,
      },
    });

    return serializeBigInt(this.enrichAccount(account));
  }
}
