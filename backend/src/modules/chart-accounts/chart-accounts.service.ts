import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';
import { TenantContext } from '../../common/tenant/tenant.context.js';

import { CreateChartAccountDto } from './dto/create-chart-account.dto.js';
import { UpdateChartAccountDto } from './dto/update-chart-account.dto.js';

@Injectable()
export class ChartAccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  async create(dto: CreateChartAccountDto) {
    const companyId = this.tenantContext.getCompanyId();

    const exists = await this.prisma.chart_accounts.findFirst({
      where: {
        company_id: companyId,
        code: dto.code,
      },
    });

    if (exists) {
      throw new ConflictException('Já existe uma conta com este código.');
    }

    return this.prisma.chart_accounts.create({
      data: {
        company_id: companyId,
        template_id: dto.template_id ? BigInt(dto.template_id) : null,
        code: dto.code,
        name: dto.name,
        category: dto.category,
        parent_id: dto.parent_id ? BigInt(dto.parent_id) : null,
        analytical: dto.analytical ?? true,
        active: dto.active ?? true,
      },
    });
  }

  async findAll() {
    const companyId = this.tenantContext.getCompanyId();

    return this.prisma.chart_accounts.findMany({
      where: {
        company_id: companyId,
      },
      include: {
        parent: true,
        children: true,
      },
      orderBy: {
        code: 'asc',
      },
    });
  }

  async findOne(id: bigint) {
    const companyId = this.tenantContext.getCompanyId();

    const account = await this.prisma.chart_accounts.findFirst({
      where: {
        id,
        company_id: companyId,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    if (!account) {
      throw new NotFoundException('Conta contábil não encontrada.');
    }

    return account;
  }

  async update(id: bigint, dto: UpdateChartAccountDto) {
    const companyId = this.tenantContext.getCompanyId();

    const account = await this.prisma.chart_accounts.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!account) {
      throw new NotFoundException('Conta contábil não encontrada.');
    }

    if (dto.code) {
      const duplicated = await this.prisma.chart_accounts.findFirst({
        where: {
          company_id: companyId,
          code: dto.code,
          NOT: {
            id,
          },
        },
      });

      if (duplicated) {
        throw new ConflictException('Já existe uma conta com este código.');
      }
    }

    return this.prisma.chart_accounts.update({
      where: {
        id,
      },
      data: {
        ...(dto.template_id && {
          template_id: BigInt(dto.template_id),
        }),
        ...(dto.parent_id && {
          parent_id: BigInt(dto.parent_id),
        }),
        ...(dto.code && {
          code: dto.code,
        }),
        ...(dto.name && {
          name: dto.name,
        }),
        ...(dto.category && {
          category: dto.category,
        }),
        ...(dto.analytical !== undefined && {
          analytical: dto.analytical,
        }),
        ...(dto.active !== undefined && {
          active: dto.active,
        }),
      },
    });
  }

  async remove(id: bigint) {
    const companyId = this.tenantContext.getCompanyId();

    const account = await this.prisma.chart_accounts.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!account) {
      throw new NotFoundException('Conta contábil não encontrada.');
    }

    return this.prisma.chart_accounts.delete({
      where: {
        id,
      },
    });
  }
}
